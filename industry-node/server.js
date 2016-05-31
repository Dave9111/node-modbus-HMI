'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var net = require('net');
var modbus = require('modbus-tcp');
var ProgressBar = require('progressbar.js');
var mongo = require('mongodb');
var monk = require('monk');

var analog_buffer = [];
var digital_buffer;

var db = monk('localhost:27017/nodetest');
var collection = db.get('tagdatabase');

//pushing the new values to node
var newstuff = [{ "tag" : "80TT1112", "value" : "1" }, { "tag" : "80TT8745", "value" : "2" }]
collection.insert(newstuff);

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});
app.get('/', function(req, res){
  //send the index.html file for all requests
  res.sendFile(__dirname + '/index.html');
});

app.get('/trend', function(req, res){
  res.sendFile(__dirname + '/trend.html');
});

app.post('/trend/data', function (req, res) {
  collection.find({},{},function(e,docs){
res.send('Got a POST request' + docs);
});
});
/* GET Userlist page.
app.get('/trend/data', function(req, res) {
    var db = req.db;
    var collection = db.get('tagdatabase');
    collection.find({},{},function(e,docs){
        res.render('tag', {
            "tag" : docs
        });
    });
});
*/



http.listen(3001, function(){

  console.log('listening on *:3001');

});

console.log('connecting...');
var socket = net.connect({
	host: '192.168.1.7',
	port: 502
}, function() {

	console.log('connected');
function ReadAnaloge() {

  // first variable is slave ID
  modbusClient.readInputRegisters(1, 0, 4, function(error, buffers) {

    if (error) {

      console.log('error reading register:', error.stack);
      return;
    }
    var value = buffers && buffers[0] && buffers[0].readUInt16BE(0);

    for (var i = 0; i < buffers.length; i++) {
    analog_buffer[i]=buffers[i].readUInt16BE(0);
    }


    //console.log(analog_buffer);
  });
}

function ReadDigital() {
  modbusClient.readDiscreteInputs(1, 0, 4, function(error, coils) {
    if (error) {
      console.log('error reading coils:', error.stack);
      return;
    }
    //console.log('value:', coils);
    digital_buffer = coils;
  });
}

function StoreData(){
  var newstuff = [{ "tag" : "All", "value" : analog_buffer }];
  collection.insert(newstuff);

}
setInterval( function() {
//StoreData();
}, 2000);

setInterval( function() {
ReadAnaloge();
ReadDigital();
  io.emit('analog_message', analog_buffer);
  io.emit('digital_message', digital_buffer);
}, 50);



});
socket.on('error', function(error) {

	console.log('connection failed:', error.stack);
});

var modbusClient = new modbus.Client();
modbusClient.writer().pipe(socket);
socket.pipe(modbusClient.reader());
