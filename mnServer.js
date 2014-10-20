/*global require, __dirname, console*/
var express = require('express'),
    net = require('net'),
    N = require('./nuve'),
    fs = require("fs"),
    https = require("https"),
    config = require('./../../licode_config');


var options = {
    key: fs.readFileSync('cert/key.pem').toString(),
    cert: fs.readFileSync('cert/cert.pem').toString()
};

var app = express();

var names = new Array();
var nameCorrect;

var userCounter = 0; //Sólo para getUserNameById

app.use(express.bodyParser());

app.configure(function () {
    "use strict";
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.logger());
    app.use(express.static(__dirname + '/public'));
    //app.set('views', __dirname + '/../views/');
    //disable layout
    //app.set("view options", {layout: false});
});

app.use(function (req, res, next) {
    "use strict";
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'origin, content-type');
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});

N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://localhost:3000/');

var myRoom;

N.API.getRooms(function (roomlist) {
    "use strict";
    var rooms = JSON.parse(roomlist);
    console.log(rooms.length);
    if (rooms.length === 0) {
        N.API.createRoom('myRoom', function (roomID) {
            myRoom = roomID._id;
            console.log('Created room ', myRoom);
        });
    } else {
        myRoom = rooms[0]._id;
        console.log('Using room ', myRoom);
    }
});

app.post('/createToken/', function (req, res) {
    "use strict";
    var room = myRoom,
        username = req.body.username,
        role = req.body.role;
    N.API.createToken(room, username, role, function (token) {
        console.log(token);
        res.send(token);
    });
});

app.get('/getRooms/', function (req, res) {
    "use strict";
    N.API.getRooms(function (rooms) {
        res.send(rooms);
    });
});

app.get('/getUserNames/', function(req, res){
    "use strict";
    var temp = "";
    var i;
    for(i = 0; i < names.length; i++){
        temp += names[i] + "\n";
    }
    res.send(temp);
});

app.get('/getUsers/:room', function (req, res) {
    "use strict";
    var room = req.params.room;
    N.API.getUsers(room, function (users) {
        res.send(users);
    });
});

app.listen(3001);

var server = https.createServer(options, app);
server.listen(3004);

function checkName(name){
    var i;
    for(i = 0; i < names.length; i++){
        if(names[i] == name){
            nameCorrect = false;
            return;
        }
    }
    nameCorrect = true;
}


/******* SOCKET.IO *********/
var io = require('socket.io').listen(3005);

io.sockets.on('connection', function(socket){
    
    socket.on('setName', function(data){
        checkName(data.name);
        if(nameCorrect){
            names.push(data.name);
            socket.emit('setName', {a: 'ok'});
        }else{
            socket.emit('setName', {a: 'deny'});
        }
    });

    socket.on('getListaNombres',function(){
        var tempNames = "";
        var i;
        for(i = 0; i < names.length; i++){
            tempNames += names[i] + "*";
        }
        socket.emit('updateListaNombres', {names: tempNames});
        socket.broadcast.emit('updateListaNombres', {names: tempNames});
    });

    /*socket.on('removeUser', function(data){
        var index = names.indexOf(data.user);
        names = names.splice(index, 1);
        socket.emit('userRemoved');
        socket.broadcast.emit('userRemoved');
    });*/

    //Envío de mensajes de chat
    socket.on('chat', function(data){
        //io.sockets.emit('mens', { mens: data.msg });
        socket.broadcast.emit('mens', {mens: data.msg, from: data.from});
    });

    socket.on('yt_stop', function(){
        socket.broadcast.emit('stop_yt');
    });

    socket.on('yt_pause', function(){
        socket.broadcast.emit('pause_yt');
    });

    socket.on('yt_play', function(){
        socket.broadcast.emit('play_yt');
    });

    socket.on('drawing', function(data){
        socket.broadcast.emit('draw', {x: data.x, y:data.y});
    });

    socket.on('stopDrawing', function(){
        socket.broadcast.emit('stopDraw');
    });

    socket.on('clearCanvas', function(){
        socket.broadcast.emit('clearCanvas');
    });

    socket.on('youtubeMode', function(data){
        socket.broadcast.emit('youtubeMode', {id: data.id});
    });

    socket.on('blackboardMode',function(){
        socket.broadcast.emit('blackboardMode');
    });

    socket.on('principalRol', function(data){
        socket.broadcast.emit('principalRol', {name: data.name});
    });

    socket.on('lockClosed', function(){
        socket.broadcast.emit('lockClosed');
    });

    socket.on('lockOpen', function(){
        socket.broadcast.emit('lockOpen');
    });

    socket.on('getUserNameById', function(data){
        var id = data.id;
        userCounter ++;
        //OPERACIONES
        var name = "User " + userCounter;
        socket.emit('setUserNameById', {userNameById: name});
    });

    socket.on('eraseName', function(data){
        var eraseName = data.name;
        
        checkName(eraseName);
        if(!nameCorrect){
            var i = names.indexOf(eraseName);
            names.splice(i,1);
        }else{
            return;
        }

        var tempNames = "";
        var i;
        for(i = 0; i < names.length; i++){
            tempNames += names[i] + "*";
        }

        socket.emit('updateListaNombres', {names: tempNames});
        socket.broadcast.emit('updateListaNombres', {names: tempNames});
    });

    socket.on('wannabePrincipal', function(data){
        socket.broadcast.emit('newPrincipal', {name: data.name, id: data.id});
    });

    socket.on('blackboardMode', function(){
        socket.emit('blackboardMode');
    });

    socket.on('preziMode', function(data){
        socket.broadcast.emit('preziMode', {id: data.id});
    });

    socket.on('preziNextStep', function(data){
        socket.broadcast.emit('preziNextStep', {step: data.step});
    });

    socket.on('preziPrevStep', function(data){
        socket.broadcast.emit('preziPrevStep', {step: data.step});
    });

    socket.on('debateNow', function(data){
        socket.broadcast.emit("debateNow", {moderator: data.moderator, startTime: data.startTime});
    });

    socket.on("updateTimers", function(data){
        socket.broadcast.emit("updateTimers", {newTime: data.newTime});
    });

    socket.on("startTimers", function(data){
        socket.broadcast.emit("startTimers", {startTime: data.startTime});
    });

    socket.on("stopTimers", function(){
        socket.broadcast.emit("stopTimers");
    });

    socket.on("pideTurno", function(data){
        socket.broadcast.emit("pideTurno", {name:data.name});
        socket.emit("pideTurno", {name:data.name});
    });

    socket.on("quitaTurno", function(data){
        socket.broadcast.emit("quitaTurno", {name:data.name});
        socket.emit("quitaTurno", {name:data.name});
    });

    socket.on("changePrincipalDebate", function(data){
        socket.broadcast.emit("changePrincipalDebate", {name:data.name});

    });

    socket.on("wantToBePrincipal", function(data){
        socket.broadcast.emit("wantToBePrincipal", {name: data.name});
    });

    socket.on("videoDebateChange", function(data){
        socket.broadcast.emit("videoDebateChange", {name: data.name});
    });

    socket.on("wantToBePrincipalDebate", function(data){
        socket.broadcast.emit("wantToBePrincipalDebate", {name: data.name});
    });

    socket.on("loadClassView", function(){
        socket.broadcast.emit("loadClassView");
    })
});


