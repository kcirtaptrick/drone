const pio = require('pigpio').Gpio;

const express = require('express');
const app = express();
const http = require('http').createServer(app);

var io = require('socket.io')(http);


const pins = [5, 24, 8, 27];
var drone = {
    armed: false,
    mode: 0, // 0: Gamepad, 1: Keyboard
    motor: []
}
for(let i in pins) {
    drone.motor.push({
        pin: new pio(pins[i], {mode: pio.OUTPUT}),
        pwm: 1000
    });
}
drone.setMotors = (values, update = true) => {
    for(let i in values) {
        drone.motor[i].pwm = values[i];
    }
    update && drone.updateMotors();
}
drone.updateMotors = () => {
    for(let motor of drone.motor) {
        motor.pin.servoWrite(motor.pwm = motor.pwm < 2000 ? motor.pwm > 1000 ? motor.pwm : 1000 : 2000);
    }
}
drone.printMotors = () => {
    for(let i in drone.motor) {
        console.log(`Motor ${i}: ${drone.motor[i].pwm}`);
    }
}
for(let motor of drone.motor) {
    motor.pin.servoWrite(1000);
}
io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('armed', drone.armed);
    socket.on('disconnect', function(){ 
        console.log('user disconnected');
    });
    
    socket.on('setMotors', (values) => {
        console.log('Values: ');
        console.log(values);
        for(let i in values) {
            drone.motor[i].pwm = values[i];
        }
        drone.updateMotors();
        drone.printMotors();
        
    });

    var multiplier = 10;
    socket.on('keydown', (e) => {
        console.log('Key: ' + e.key);
        switch (e.key) {
            case " ":
                console.log("Killed");
                for(let i in drone.motor) {
                    drone.motor[i].pwm = 1000;
                }
                break;
            case "ArrowUp":
                changeMotors([-1, -1, 1, 1]);
                break;
            case "ArrowDown":
                changeMotors([1, 1, -1, -1]);
                break;
            case "ArrowLeft":
                changeMotors([1, -1, -1, 1]);
                break;
            case "ArrowRight":
                changeMotors([-1, 1, 1, -1]);
                break;
            case "w":
                changeMotors([1, 1, 1, 1]);
                break;
            case "s":
                changeMotors([-1, -1, -1, -1]);
                break;
            case "d":
                changeMotors([-1, 1, -1, 1]);
                break;
            case "a":
                changeMotors([1, -1, 1, -1]);
                break;
        }
        if(!isNaN(e.key)) {
            multiplier = e.key == "0" ? 10 : Number(e.key);
            console.log('Multiplier: ' + multiplier);
        }
        drone.updateMotors();
        drone.printMotors();
        function changeMotors(values) {
            for(let i in values) {
                drone.motor[i].pwm += values[i] * multiplier;
            }
        }
    });

    socket.on('gamepadState', (state) => {
        // if(checkButtons())
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
                drone.motor[0].pin.servoWrite((1000 + postUp + calc(control.pitch, false) + calc(control.roll, false)).toFixed(0));
                drone.motor[1].pin.servoWrite((1000 + postUp + calc(control.pitch, false) - calc(control.roll, true)).toFixed(0));
                drone.motor[2].pin.servoWrite((1000 + postUp - calc(control.pitch, true) - calc(control.roll, true)).toFixed(0));
                drone.motor[3].pin.servoWrite((1000 + postUp - calc(control.pitch, true) + calc(control.roll, false)).toFixed(0));
                console.log('Motor 0: ' + (1000 + postUp + calc(control.pitch, false) + calc(control.roll, false)).toFixed(0));
                console.log('Motor 1: ' + (1000 + postUp + calc(control.pitch, false) - calc(control.roll, true)).toFixed(0));
                console.log('Motor 2: ' + (1000 + postUp - calc(control.pitch, true) - calc(control.roll, true)).toFixed(0));
                console.log('Motor 3: ' + (1000 + postUp - calc(control.pitch, true) + calc(control.roll, false)).toFixed(0));
            }
        } else {
            if(state.buttons[9]){drone.armed = true};
        }
        console.log(state);

        function checkButtons() {
            for(let arg of arguments) {
                if(state.buttons[arg]) {return false;}
            }
            return true;
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
app.get('/calibrate', (req, res) => {
    res.render('calibrate', {
        title: 'Calibrate'
    });
});

const server = http.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
