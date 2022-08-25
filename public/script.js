const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peerServer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // listen the room on the server(socket).
    socket.on('user-connected', (userId) => {
      connecteToNewUser(userId, stream);
    });
  });

// peer connection
peerServer.on('open', (id) => {
  // send information browser to the server(socket)
  socket.emit('join-room', ROOM_ID, id);
});

const connecteToNewUser = (userId, stream) => {
  const call = peerServer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    // Show stream in some video/canvas element.
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};
