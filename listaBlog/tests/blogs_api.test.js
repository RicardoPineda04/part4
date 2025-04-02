const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')

describe('Inicializando Blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('Blogs are returned as json', async () => {
    await api
      .get('/api/blog')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('id is defined', async () => {
    const response = await api.get('/api/blog')
    const blogs = response.body

    blogs.forEach(blog => {
      assert.ok(blog.hasOwnProperty('id'), 'Blog does not have id property')
    })
  })

  test('valid blog can be added', async () =>{
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    }

    await api
      .post('/api/blog')
      .send(newBlog)
      .expect(201)

      const response = await api.get('/api/blog')
      const contents = response.body.map(b => b.title)
      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
      assert(contents.includes('Canonical string reduction'))
  })

  test('like is undefined', async () => {
    const newBlog = {
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    }

    const response = await api
      .post('/api/blog')
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('title or url is undefined', async () => {
    const newBlog = {
      author: "Robert C. Martin"
    }
  
    await api
      .post('/api/blog')
      .send(newBlog)
      .expect(400)
  })

  test('a blog can deleted', async () => {
    const blogsIniciales = await helper.blogsInDb()
    const blogToDelete = blogsIniciales[0]

    await api
      .delete(`/api/blog/${blogToDelete.id}`)
      .expect(204)

      const blogsNuevos = await helper.blogsInDb()
      assert.strictEqual(blogsNuevos.length, blogsIniciales.length - 1)

      const blogs = blogsNuevos.map(b => b.title)

      assert(!blogs.includes(blogToDelete.title))
  })

  test('a blog can be updated', async () => {
    const blogIniciales = await helper.blogsInDb()
    const blogToUpdate = blogIniciales[0]

    const updateBlog = {
      title: 'Go To Statement Considered Harmful Updated',
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5
    }
    await api
      .put(`/api/blog/${blogToUpdate.id}`)
      .send(updateBlog)
      .expect(200)

      const blogDespues = await helper.blogsInDb()
      const updatedBlog = blogDespues.find(blog => blog.id === blogToUpdate.id)

      assert.strictEqual(updatedBlog.title, updateBlog.title)
  })
})

after(async () => {
  await mongoose.connection.close()
})