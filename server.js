'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect('mongodb://admin:enter6@ds159036.mlab.com:59036/short-url-api', { useMongoClient: true });

const ShortURL = mongoose.model('ShortURL', new mongoose.Schema({
  original_url: String,
  short_url: Number,
  adress: String
}));

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//add new URL

app.route("/api/shorturl/new")
  .get(function (req, res) {
    if (req.query.url.indexOf("http://") == -1 && req.query.url.indexOf("https://") == -1) {
      res.json({ "error": "invalid URL" });
    } else {
      let url;
      if (req.query.url.indexOf("http://") !== -1) {
        url = req.query.url.split("http://")[1];
      } else if (req.query.url.indexOf("https://") !== -1) {
        url = req.query.url.split("https://")[1];
      }

      dns.lookup(url, {}, (err, adress) => {
        if (err) {
          res.json({ error: 'Invalid URL' });
        } else {
          ShortURL.find({}, (err, data) => {
            const newUrl = new ShortURL({ original_url: req.query.url, short_url: data.length + 1, adress: adress });
            newUrl.save((err, data) => {
              res.json({ original_url: data.original_url, short_url: data.short_url });
            })
          })
        }
      })
    }
  })
  .post(function (req, res) {
    if (req.body.url.indexOf("http://") == -1 && req.body.url.indexOf("https://") == -1) {
      res.json({ "error": "invalid URL" });
    } else {
      let url;
      if (req.body.url.indexOf("http://") !== -1) {
        url = req.body.url.split("http://")[1];
      } else if (req.body.url.indexOf("https://") !== -1) {
        url = req.body.url.split("https://")[1];
      }

      dns.lookup(url, {}, (err, adress) => {
        if (err) {
          res.json({ error: 'Invalid URL' });
        } else {
          ShortURL.find({}, (err, data) => {
            const newUrl = new ShortURL({ original_url: req.body.url, short_url: data.length + 1, adress: adress });
            newUrl.save((err, data) => {
              res.json({ original_url: data.original_url, short_url: data.short_url });
            })
          })
        }
      })
    }
  })

app.get("/api/shorturl/:short_url", function (req, res) {
  ShortURL.findOne({ short_url: req.params.short_url }, (err, data) => {
    if (err || data === null) {
      res.json({ "error": "No short url found for given input" })
    } else {
      res.status(301).redirect(data.original_url);
    }
  });
});

// list all db documents
app.get("/api/allurls", function (req, res) {
  ShortURL.find({}, (err, data) => {
    const list = data.map(item => {
      return { original_url: item.original_url, short_url: item.short_url, adress: item.adress }
    })
    res.json({ data: list, length: list.length });
  })
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});