const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve your HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Store player data in memory
const players = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 1. Create a new player entry
    players[socket.id] = {
        id: socket.id,
        x: 0,
        y: 0,
        z: 0,
        ry: 0,
        name: "Guest",
        // Added these to store appearance on the server too
        colors: { body: '#111111', head: '#FFFF00', hat: '#ff0000' },
        hatStyle: 'none'
    };

    // 2. Initial Sync
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // 3. Handle Movement
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].z = movementData.z;
            players[socket.id].ry = movementData.ry;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // 4. Handle Appearance (MOVED INSIDE HERE)
    socket.on('updateAppearance', (data) => {
        if (players[socket.id]) {
            // Update the server's memory so new people see the right hat
            if (data.type === 'body') players[socket.id].colors.body = data.color;
            if (data.type === 'head') players[socket.id].colors.head = data.color;
            if (data.type === 'hatStyle') players[socket.id].hatStyle = data.style;

            data.id = socket.id;
            socket.broadcast.emit('updatePlayerAppearance', data);
        }
    });

    // 5. Handle Name Updates
    socket.on('updateName', (newName) => {
        if (players[socket.id]) {
            players[socket.id].name = newName;
            socket.broadcast.emit('nameUpdate', { id: socket.id, name: newName });
        }
    });

    // 6. Handle Chat Messages
    socket.on('chatMessage', (msg) => {
        if (players[socket.id]) {
            io.emit('chatMessage', {
                id: socket.id,
                name: players[socket.id].name,
                msg: msg
            });
        }
    });

    // 7. Handle Disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// Start the server
http.listen(PORT, () => {
    console.log(`Forest World running on http://localhost:${PORT}`);
});