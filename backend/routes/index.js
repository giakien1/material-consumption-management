

function route(app) {
    app.use('/api/', homeController);
  };

module.exports = route;