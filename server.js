var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';

var insertDocument = function(_email, _password, db, callback) {
    console.log('About to insert user ', email);
   db.collection('users').insertOne( {
      email : _email,
      password : _password
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted ", _email," in to the users collection.");
    callback();
  });
};

var findUser = function(_email, _password, db, callback) {
  /*db.collection('users').find({}).toArray(function(err, docs){
    assert.equal(err, null);
    console.log("Found these");
    console.log(docs);
    callback(null);
  });
  */ 
  db.collection('users').findOne( {
   email : _email,
   password : _password,
    } , function(err, doc){
        console.log("looked for user")
        if(doc == null){
          console.log("Found null");
          callback(null);
        }
        else
          console.log(doc.password);
        
        //return if the the (email -> password) was found back to the caller
        callback(false);
   });
   //*/
};


app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket){
  console.log('A user has connected');

  socket.on('login', function (email, password) {
		console.log('A user is trying to login');
		MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      //call a function to find (email->password) entry was found and get a response
      findUser(email, password, db, function(found) {
        if(found == true){
          socket.emit('login_status', 'VERIFIED');
        }
        else{
          socket.emit('login_status', 'WRONG_PASSWORD');
        }
        db.close();
      });
    });

  });

  socket.on('disconnect', function(){
      console.log('user disconnected');
    });

  socket.on('register', function (email, password) {
  		console.log('User ', email, 'is regestrating');
  		MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
          insertDocument(email, password, db, function() {
              db.close();
          });
        });
  		socket.emit('register_status', 'INSERTED');
    });
});

server.listen(port, function(){
  console.log('listening on ',port);
});

