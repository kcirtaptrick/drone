var socketio = io('192.168.86.100:7000');


function pollGamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    for (var i = 0; i < gamepads.length; i++) {
        var gp = gamepads[i];
        if (gp) {
            document.querySelector('#gamepad p').innerHTML = "Gamepad connected at index " + gp.index + ": " + gp.id +
            ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.";

        }
    }
}
pollGamepads();
window.addEventListener("gamepadconnected", function(e) {
    var gp = navigator.getGamepads()[e.gamepad.index];
    document.querySelector('#gamepad p').innerHTML = "Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.";
  
    gameLoop();
  });
window.addEventListener("gamepaddisconnected", function(e) {
    console.log("Gamepad disconnected from index %d: %s",
        e.gamepad.index, e.gamepad.id);
    document.querySelector('#gamepad p').innerHTML = "Gamepad disconnected";
});