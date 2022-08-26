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
      // other user call us and we answer the user
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

    //send message from browser to the server(socket)
    let text = $('input');
    $('html').keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('');
      }
    });

    // get message from server(socket) to th browser.
    socket.on('createMessage', (data) => {
      $('ul').append(
        `<li class="message"><b>${data.userId} : </b><br/>${data.message}</li>`
      );
      scrollToBottom();
    });
  });

// socket disconnected
socket.on('user-disconnected', (userId) => {
  if (peers[userId]) peers[userId].close();
});
// peer connection
peerServer.on('open', (userId) => {
  // send ( ROOM_ID, userId ) browser to the server(socket)
  socket.emit('join-room', ROOM_ID, userId);
});

const connecteToNewUser = (userId, stream) => {
  const call = peerServer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    // Show stream in some video/canvas element.
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop('scrollHeight'));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log('object');
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};
