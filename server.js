/* EXPRESS BLOG APP */

// dependencies
const express = require('express');
const bodyParser= require('body-parser');
const mongo = require('mongodb');

// app
const app = express();
// mongoDB
Server = mongo.Server;
Db = mongo.Db;
// local mongo db server
var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('expressBlog', server);
// mongo ObjectID
var ObjectId = mongo.ObjectID;

db.open((err, db) => {
  if(!err) {
    app.listen(3000, () => {
      console.log("Running on http://localhost:3000");
    });

    app.use(bodyParser.urlencoded({extended: true}));
    app.use('/static', express.static('static'));
    app.set('view engine', 'ejs');
    // app.set('views', __dirname + 'views');

    // home view
    app.get('/', (req, res) => {
      locals = {};

      db.collection('posts').find().toArray((err, results) => {
        if (err) return console.log(err);
        locals.posts = results;

        if (req.query.edit === "") {
          db.collection('posts').findOne(
            {_id: ObjectId(req.query.id)},
            (err, result) => {
              if (err) return console.log(err);
              locals.post = result;

              res.render('home.ejs', locals);
              // res.send('Hello World');
              // res.sendFile(__dirname + '/blog/home.html');
            }
          );
        } else {
          res.render('home.ejs', locals);
        }

      });
    });

    // create post
    app.post('/new', (req, res) => {
      db.collection('posts').save(req.body, (err, result) => {
        if (err) return console.log(err);
        res.redirect('/');
      });
    });

    // edit post
    app.post('/edit', (req, res) => {
      db.collection('posts').update(
        {_id: ObjectId(req.body.id)},
        req.body,
        (err, result) => {
          if (err) return console.log(err);
          res.redirect('/');
        }
      );
    });

    // delete post
    app.post('/delete', (req, res) => {
      db.collection('posts').remove(
        {_id: ObjectId(req.body.id)}
      );
      res.redirect('/');
    });
  } else {
    console.log("Error connecting to DB.");
  }
});