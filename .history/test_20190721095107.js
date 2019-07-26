const pio = require('pigpio').Gpio;

const motor = [new pio(5, {mode: pio.OUTPUT}), new pio(24, {mode: pio.OUTPUT}), new pio(8, {mode: pio.OUTPUT}), new pio(27, {mode: pio.OUTPUT})];

const express = require('express');
const app = express();
const http = require('http').createServer(app);

var io = require('socket.io')(http);


var drone = {
    armed: false
}

io.on('connection', function(socket){
    console.log('a user connected');
    socket.broadcast('armed', )
    socket.on('disconnect', function(){ 
        console.log('user disconnected');
    });
    var user = {
        start: false
    }
    socket.on('gamepadState', (state) => {
        const control = {
            up: (1 - state.axis[0][1]) / 2,
            pitch: state.axis[1][1],
            roll: state.axis[1][0],
            yaw: state.axis[0][0]
        }
        
        const postUp = control.up * 1000;
        const calc = (value, direction) => {
            if(direction) {
                return value < 0 ? (1000 - postUp) / 2 * value : postUp / 2 * value;
            } else {
                return value < 0 ? postUp / 2 * value : (1000 - postUp) / 2 * value;
            }
        }
        const pitchFront = control.pitch < 0 ? postUp + (1000 - postUp) * -control.pitch : postUp * (1 - control.pitch);
        const rollLeft = control.roll < 0 ? postUp * (1 - -control.roll) : postUp + (1000 - postUp) * control.roll;
        if(drone.armed) {
            if(state.buttons[8]) {
                drone.armed = false;
            } else {
                motor[0].servoWrite((1000 + postUp + calc(control.pitch, false) + calc(control.roll, false)).toFixed(0));
                motor[1].servoWrite((1000 + postUp + calc(control.pitch, false) - calc(control.roll, true)).toFixed(0));
                motor[2].servoWrite((1000 + postUp - calc(control.pitch, true) - calc(control.roll, true)).toFixed(0));
                motor[3].servoWrite((1000 + postUp - calc(control.pitch, true) + calc(control.roll, false)).toFixed(0));
                console.log('Motor 0: ' + (1000 + postUp + calc(control.pitch, false) + calc(control.roll, false)).toFixed(0));
                console.log('Motor 1: ' + (1000 + postUp + calc(control.pitch, false) - calc(control.roll, true)).toFixed(0));
                console.log('Motor 2: ' + (1000 + postUp - calc(control.pitch, true) - calc(control.roll, true)).toFixed(0));
                console.log('Motor 3: ' + (1000 + postUp - calc(control.pitch, true) + calc(control.roll, false)).toFixed(0));
            }
        } else {
            if(state.buttons[9]){drone.armed = true};
        }
        console.log(state);

        function checkGamepad() {
            for(let arg of arguments) {
                if( state.buttons[arg]) {return false;}
                
            }
        }
        
    });
});


app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Control'
    });
});

const server = http.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
