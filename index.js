const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');
const io = require('socket.io')(http);
const compression = require('compression');
//persist current song
var currentSong = "";
app.use(compression());
app.use(express.static(__dirname + '/client'));

// Set static path to bower_components directory
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/minIndex.html');
});


io.on('connection', function(socket){
  socket.on('findArtist', function(cb) {
    io.emit('findArtist', cb);
  });
  
  console.log("I just connected", currentSong + " is playing");

  socket.on('removeSong', function (cb) {
      console.log('remove Song received');
      io.emit('removeSong', cb);
    });

  socket.on('playNpause', function(cb){
    console.log("index.js socket.on playNpause invoked", cb);
    if(cb.status === 'play'){
      console.log('status was play', cb.id);
      currentSong = cb.id;
    }
    io.emit('playNpause', cb);
    // socket.emit('playNpause', cb);
  });

  socket.on('username', function(name){
    socket['name'] = name;
  });

  socket.on('chat message', function(msg){
    console.log('logged in', msg);
    io.emit('chat message', msg.username + ": " + msg.msg);
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function (data) {
    socket.broadcast.emit('typing', {
      name: data
    });
  });
  
  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function (data) {
    socket.broadcast.emit('stop typing', {
      name: data
    });
  });

  socket.on('disconnect', function(){
    // console.log('user disconnected');
  });
});

//Initializing http on io makes it so its listening on this port
http.listen(process.env.PORT || 8000, function(){
  console.log('App listening on port 8000');
});

