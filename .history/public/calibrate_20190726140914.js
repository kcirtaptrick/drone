
var socket = io('192.168.86.100:7000');

document.addEventListener('keydown', (e) => {
    socket.emit('keydown', e);
});