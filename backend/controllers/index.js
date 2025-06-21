const albumsRouter = require('./bookController');
const progressRouter = require('./progressController');
const userRouter = require('./userController');

module.exports = (app) => {
  app.use('/api', albumsRouter);
  app.use('/api', progressRouter);
  app.use('/api', userRouter);
};