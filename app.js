const express = require('express')
let app = require('express')();

let http = require('http').Server(app);
let io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

let name = 'Player 1';

io.on('connection', function (socket) {
    console.log('A user connected');

    socket.on("resName", (data) => {
        name = (data.myName === 'Player 1') ? "Player 2" : "Player 1";
        console.log(name);
    });

    socket.emit("PlayerName", name);

    name = (name === 'Player 1') ? "Player 2" : "Player 1";

    socket.on('sendData', (data) => {
        io.sockets.emit('sendRes', data);
    })

    socket.on('disconnect', function (data) {
        console.log('A user disconnected');
        io.sockets.emit('checkWhoStayed');
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});


// let express = require('express');
// let app = express();
// let fs = require('fs');
// let https = require('https');

// let server = https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
// }, app);

// let io = require('socket.io')(server);

// app.use(express.static(__dirname));

// app.get('/', function (req, res) {
//     res.sendfile('index.html');
// });

// let name = 'Player 1';

// io.on('connection', function (socket) {
//     console.log('A user connected');

//     socket.emit("PlayerName", name);
//     name = (name === 'Player 1') ? "Player 2" : "Player 1";

//     socket.on('sendData', (data) => {
//         io.sockets.emit('sendRes', data);
//     });

//     socket.on('disconnect', function () {
//         console.log('A user disconnected');
//     });
// });

// server.listen(3000, function () {
//     console.log('listening on *:3000');
// });