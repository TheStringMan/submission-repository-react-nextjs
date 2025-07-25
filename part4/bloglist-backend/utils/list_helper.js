const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((partialSum, a) => partialSum + a.likes, 0);
}

const favoriteBlog = (blogs) => {
  return blogs.reduce(function(favourite, current) {
    return (favourite && favourite.likes > current.likes) ? favourite : current
  })
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}