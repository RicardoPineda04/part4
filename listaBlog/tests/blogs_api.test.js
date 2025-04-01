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
})

after(async () => {
  await mongoose.connection.close()
})