const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const registeredUsers = new Map();

const isUserRegistered = (username, password) => {
    return registeredUsers.has(username) && registeredUsers.get(username) === password;
};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('register', ({ username, password}) => {
        if(!registeredUsers.has(username)) {
            registeredUsers.set(username, password);
            socket.emit('reistrationSuccess');
        } else {
            socket.emit('registrationError', 'Username already exists');
        }
    });

    socket.on('chat message', ({ username, message}) => {
        if(isUserRegistered(username)) {
            console.log('message: ' + message);

            io.emit('chat message', {username, message});
        } else {
            socket.emit('registrationError', 'You must register to send messages');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server listening on port ${PORT}');
});