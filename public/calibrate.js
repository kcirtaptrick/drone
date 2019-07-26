
var socket = io('192.168.86.100:7000');

document.addEventListener('keydown', (e) => {
    console.log(e);
    socket.emit('keydown', e);
    console.log(e);
});