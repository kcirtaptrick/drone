
var socket = io('192.168.86.100:7000');

document.addEventListener('keydown', (e) => {
    console.log(e.key);
    socket.emit('keydown', {key: e.key});
    console.log(e);
});