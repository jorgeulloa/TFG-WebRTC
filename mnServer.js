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
var nameLock;
var typeRoom = "reunion";
var state = 'blackboard';
var idYoutube;
var preziId;
var principalName;
var debateModerator;
var debateStartTime;
var arrayDibujoX = [];
var arrayDibujoY = [];
var stepYoutube = 0;
var stepPrezi = 0;
var nameAdmin;


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
        arrayDibujoX.push(data.x);
        arrayDibujoY.push(data.y);
        socket.broadcast.emit('draw', {x: data.x, y:data.y});
    });

    socket.on('stopDrawing', function(){
        arrayDibujoX.push("salto");
        arrayDibujoY.push("salto");
        socket.broadcast.emit('stopDraw');
    });

    socket.on('clearCanvas', function(){
        arrayDibujoX = [];
        arrayDibujoY = [];
        socket.broadcast.emit('clearCanvas');
    });

    socket.on('youtubeMode', function(data){
        state = 'youtube';
        idYoutube = data.id;
        socket.broadcast.emit('youtubeMode', {id: data.id});
    });

    socket.on('blackboardMode',function(){
        state = 'blackboard';
        socket.broadcast.emit('blackboardMode');

        //initialDraw();

    });

    socket.on('principalRol', function(data){
        socket.broadcast.emit('principalRol', {name: data.name});
    });

    socket.on('lockClosed', function(data){
        nameLock = data.name
        socket.broadcast.emit('lockClosed');
    });

    socket.on('lockOpen', function(data){
        if (data.name == nameLock){
            socket.broadcast.emit('lockOpen');
            nameLock = null;
        } else{
            return
        }
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
        console.log("recibido " + data.name + " el del candado " + nameLock);
        
        checkName(eraseName);
        if(!nameCorrect){
            var i = names.indexOf(eraseName);
            names.splice(i,1);
            if (data.name == nameLock && data.name != principalName){
                socket.emit('lockDisconnect', {a: "candado"});
            }else if (data.name == principalName && data.name != nameLock){
                socket.emit('lockDisconnect' , {a: "video"});
            } else if (data.name == principalName && data.name == nameLock){
                socket.emit('lockDisconnect' , {a: "ambos"});
            }
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

    /*socket.on('blackboardMode', function(){
        socket.emit('blackboardMode');
    });*/

    socket.on('preziMode', function(data){
        state = 'prezi';
        preziId = data.id;
        socket.broadcast.emit('preziMode', {id: data.id});
    });

    socket.on('preziNextStep', function(data){
        socket.broadcast.emit('preziNextStep', {step: data.step});
    });

    socket.on('preziPrevStep', function(data){
        socket.broadcast.emit('preziPrevStep', {step: data.step});
    });

    socket.on('debateNow', function(data){
        state = 'debate';
        debateModerator = data.moderator;
        depateStartTime = data.startTime;
        socket.broadcast.emit("debateNow", {moderator: data.moderator, startTime: data.startTime});
    });

    socket.on("updateTimers", function(data){
        debateStartTime = data.newTime;
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
        principalName = data.name;
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
    });

    // Comprobaciones del tipo de sala en el momento de conexión

    socket.on("getNumConnection", function(data){
        if(names.length == 1 || nameAdmin == data.name){
            nameAdmin = data.name;
            socket.emit('getNumConnection', {a: 'ok'});
        }else{
            socket.emit('getNumConnection', {a: 'deny'});
        }
    });
    socket.on("setRoomType", function(data){
        if(data.type == true){
            typeRoom = "aula";
            socket.broadcast.emit("changeRoomType", {a: typeRoom});
        }else{
            typeRoom = "reunion";
            socket.broadcast.emit("changeRoomType", {a: typeRoom});
        }
    });

    socket.on("sendRoomType", function(){
        if (typeRoom == "aula"){
            socket.emit("sendRoomType", {a: 'aula'});
        } else{
            socket.emit("sendRoomType", {a: 'reunion'});
        }
    });

    socket.on('setEstado', function() {
        if (state == "youtube"){
            stepYoutube = 0;
            getMinuto();
            
        }
        if (state == "blackboard"){
            socket.emit('blackboardMode');
            initialDraw();
        }
        if (state == "prezi"){
            stepPrezi = 0;
            getPreziStep();
            //socket.emit('preziMode', {id: preziId});
        }
        if (state == "debate"){
            console.log("tiempo " + debateStartTime);
            if(debateStartTime==null){
                debateStartTime=30;
            }
            socket.emit("debateNow", {moderator: debateModerator, startTime: debateStartTime});
        }
        
    });

    socket.on('getPrincipal', function(data) {
        if (principalName != null && principalName != data.name && data.a == "primera"){
            socket.emit("returnPrincipal", {name: principalName});
        }

        if (nameLock != null){
            setInitialLock();
        }

    });

    function setInitialLock(){
        socket.emit('lockInitialClosed');
    }

    function initialDraw(){
        for (var index = 0; index < arrayDibujoX.length; index++) {
            socket.emit('draw', {x: arrayDibujoX[index], y:arrayDibujoY[index]});
            
        }
    }

    function getMinuto(){
        socket.broadcast.emit('getMinuto');
    }

    function getPreziStep(){
        socket.broadcast.emit('getPreziStep');
       //.getCurrentStep()
    }

    socket.on('setMinuto', function(data){
        if (stepYoutube == 0){
            var minCompleto = "" + data.min;
            var minuto = minCompleto.split(".")[0];
            stepYoutube++;
            socket.broadcast.emit('youtubeMode', {id: idYoutube, min: minuto} );
        }
        
    });

    socket.on('setPreziStep', function(data){
        if (stepPrezi == 0){
            var step = data.step;
            stepPrezi++;
            socket.broadcast.emit('preziMode', {id: preziId, step: step} );
        }
        
    });

       
});


