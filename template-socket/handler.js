'use strict';

const Application = require('cerberus-mvc/System/Application');
const express = require('express');
const http = require('http').Server(express());
const SOCKET_PORT = 3000
const io = require('socket.io')(http, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		allowedHeaders: ["authorization"]
	}
});

// const AuthService = require('./src/Service/Auth.js'); // add in your service
// const AuthMiddleware = require('./src/Middleware/Auth.js'); // add in your middleware

io.on('connection', (socket) => {
	socket.onAny((route, data) => {
		console.log(route, data);

		const app = new Application('socket');
		// const authService = new AuthService(); // add in your service
		// const authMiddleware = new AuthMiddleware(); // add in your middleware

		// app.service(authService); // add in your service
		// app.middleware(authMiddleware); // add in your middleware

		app.run({ route, data, socket, io });
	});
});

http.listen(SOCKET_PORT, () => {
	console.log('Socket API listening on http://localhost:' + SOCKET_PORT);
});