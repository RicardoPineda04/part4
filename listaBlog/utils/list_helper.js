const dummy = (blogs) => {
  return 1
}

const totalLikes = (blog) => {
  return blog.reduce((sum, item) => { return sum + item.likes }, 0)
}

const favoriteBlog = (blog) => {
  return blog.reduce((max, item) => max.likes > item.likes ? max : item, blog[0])
}

const getTopAuthor = (blogs) => {
  const authorCounts = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + 1;
    return acc;
  }, {});

  const topAuthor = Object.entries(authorCounts).reduce((max, [author, count]) => {
    return count > max.blogs ? { author, blogs: count } : max;
  }, { author: "", blogs: 0 });

  return topAuthor;
};

const getMostLikedAuthor = (blogs) => {
  const authorLikes = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + blog.likes;
    return acc;
  }, {});

  const topAuthor = Object.entries(authorLikes).reduce((max, [author, likes]) => {
    return likes > max.likes ? { author, likes } : max;
  }, { author: "", likes: 0 });

  return topAuthor;
};


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  getTopAuthor,
  getMostLikedAuthor
}