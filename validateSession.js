const express = require('express');
const app = express();

app.use(function (req, res, next) {
    console.log(req)
    if (!req.isAuthenticated() || !req.session.id)
        res.send({data: null, err:'Not Authenticated'})
    else 
        return next();
  });

  module.exports = app;