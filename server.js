var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';

var insertDocument = function(email, password, db, callback) {
    console.log('About to insert user ', email);
   db.collection('users').insertOne( {
      email : email,
      password : password
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};

var findUser = function(email, password, db, callback) {
   db.collection('restaurants').findOne( {
   email: password,
    } , function(err, doc){
        console.log("looked for user")
        #return if the the (email -> password) was found back to the caller
        callback( (doc != null) );
   });
};


app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('login', function (email, password) {
		console.log('User is trying to login');
		MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
          #call a function to find (email->password) entry was found and get a response
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

  socket.on('register', function (email, password) {
  		console.log('User ', email, 'is regestrating');
  		MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
          insertDocument(email, password, db, function() {
              db.close();
          });
        });
  		socket.emit('login_status', 'INSERTED');
    });
});

server.listen(port, function(){
  console.log('listening on '+port);
});

