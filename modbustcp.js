'use strict';

var net = require('net');
var modbus = require('modbus-tcp');

console.log('connecting...');
var socket = net.connect({
	host: '192.168.1.7',
	port: 502
}, function() {

	console.log('connected');

	function ReadAnaloge() {
		modbusClient.readInputRegisters(1, 0, 4, function(error, buffers) {

			if (error) {

				console.log('error reading register:', error.stack);
				return;
			}
			var value = buffers && buffers[0] && buffers[0].readUInt16BE(0);
			var value2 = buffers && buffers[1] && buffers[1].readUInt16BE(0);
			//console.log('value:', buffers[0].readUInt16BE(0));
			var buff = [];
			for (var i = 0; i < buffers.length; i++) {
			buff[i]=buffers[i].readUInt16BE(0);
			}
			console.log(buff);
		});
	}

	function ReadDigital() {
		modbusClient.readCoils(1, 0, 4, function(error, coils) {
			if (error) {
				console.log('error reading coils:', error.stack);
				return;
			}
			console.log('value:', coils);
		});
	}

	setInterval(ReadAnaloge, 100);
	setInterval(ReadDigital, 100);

});
socket.on('error', function(error) {

	console.log('connection failed:', error.stack);
});

var modbusClient = new modbus.Client();
modbusClient.writer().pipe(socket);
socket.pipe(modbusClient.reader());
