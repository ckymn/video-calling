require('dotenv').config();
const express = require('express');
const socket = require('socket.io');
const { ExpressPeerServer } = require('peer');
const { v4: uuid4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuid4()}`);
});

app.get('/:room', (req, res) => {
  const { room } = req.params;
  res.render('room', { roomId: room });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// socket.io

const io = socket(server);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use('/peerjs', peerServer);

// connection socket.io
io.on('connection', (socket) => {
  // listen the room on the browser.
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    // stream to everyobody
    socket.broadcast.emit('user-connected', userId); // io.sockets.emit('join-room',data)
    //listen the message on the browser
    socket.on('message', (message) => {
      socket.emit('createMessage', { message, userId });
    });
  });
});
