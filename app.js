// app.js
const express = require('express')
const app = express()
var cors = require('cors')
app.use(cors())

const pool = require('./database/dbConnPool')

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const aziendeRouters = require('./routes/aziende')
const optionsRouter = require('./routes/options')

app.use(function(req, res, next) {

  console.log(req.hostname)
  console.log(req.url)
  next();

});

app.use('/aziende', aziendeRouters);
app.use('/options', optionsRouter);


app.get('/hello', (req, res) =>{
  res.send('Hello World!');
})

module.exports = app;

