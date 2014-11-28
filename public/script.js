/* 
 *  MN.RTC
 *   Marco Nattero Santiago (2014)
 *
 *
 * Posee el método window.onload, que se encarga de:
 *  - Capturar el username
 *  - Inicializar el stream
 *  - Gestionar los eventos de la Room
 *
*/

var socket = io.connect('http://192.168.1.10:3005');
var serverUrl = "/";
var localStream, room, recording;
var idVideos = new Array(); //Guarda los IDs de cada vídeo de invitado con su respectivo nombre
var nombre; //username
var idStream; //id
var listaNombres;
var type; //tipo de sala
var numeroConexion;

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function startRecording (){
  if (room!=undefined){
    if (!recording){
      room.startRecording(localStream);
      recording = true;
    }else{
      room.stopRecording(localStream);
      recording = false;
    }
  }
}

// Al iniciar la aplicación
window.onload = function () {
  recording = false;
  var screen = getParameterByName("screen");

  /*** CAPTURA DE USERNAME ***/
  // Pide el nombre de usuario
  nombre = prompt("¿Cuál es tu nombre?");

  // Envía el nombre al servidor y comprueba que no está siendo utilizado
  socket.emit('setName', {name: nombre});

  // Recibe un 'deny' si el nombre ya está siendo utilizado
  socket.on('setName', function(data){
    if(data.a == 'deny'){
      getName();
    }
    else{
      socket.emit('getNumConnection'); //Cuando el nombre es correcto mira a ver cuantos hay ya
    }
  });

  // Recibe ok si es el primero en la room y permite elegir tipo de sala y lo fija. Si recibe deny
  // pide el tipo de sala para saber que controles pintar
  socket.on('getNumConnection', function(data){
    if(data.a == 'ok'){
      $("#selectionRoom").show();
      $("#alternar-panel-oculto").text('Cerrar el panel');

    } else{
      document.getElementById("supMenuPanel").innerHTML="";
      socket.emit('sendRoomType');
      
    }
  });

  // Si recibe este mensaje, es que el tipo es aula y no tiene que pintar ciertos controles
  socket.on('sendRoomType', function(data){
    if (data.a == 'aula'){
      document.getElementById("activeBlackboard").style.display = "none";
      document.getElementById("activeYouTube").style.display = "none";
      document.getElementById("activePrezi").style.display = "none";
      socket.emit('setEstado');
    } else{
      socket.emit('setEstado');
    }
  });
  // Si el nombre está siendo utilizado lo pide de nuevo
  function getName(){
    nombre = prompt("Nombre no válido. Elige otro.");
    socket.emit('setName', {name: nombre});
  }

    function getPrincipal(){
    socket.emit('getPrincipal', {name: nombre, a: numeroConexion});
  }

  socket.on("returnPrincipal", function(data){
  document.getElementById("myVideo").innerHTML = "";
  var newName = data.name;
  var newStream = room.getStreamsByAttribute("name", newName);
  document.getElementById("principalName").innerHTML = "<i class=\"icon-user\"></i> " + newName;
  document.getElementById("principalRolBtn").disabled=false;
    document.getElementById("divPrincipalName").style.display = "block !important";
  newStream[0].show("myVideo");
  numeroConexion = "segunda";
});

  
  // Pide al servidor la lista de nombres para actualizarla
  socket.emit('getListaNombres');

  // Coloca el nombre de usuario en pantalla
  document.getElementById("nombreUsuario").innerHTML = "Connected as  <strong>" + nombre + "</strong>"; //"<li id=\"titleControl\"><span style=\"margin-left:80px;\">" + nombre + "</span></li>";




  /*** FIN CAPTURA USERNAME ***/



  /*** INICIALIZACIÓN DEL STREAM ***/
  // Creo el localStream (le añado attributes:{name:""})
  localStream = Erizo.Stream({audio: true, video: true, data: true, attributes: {name: nombre}, screen: screen, videoSize: [640, 480, 640, 480]});
  var createToken = function(userName, role, callback) {

    var req = new XMLHttpRequest();
    var url = serverUrl + 'createToken/';
    var body = {username: userName, role: role};

    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        callback(req.responseText);
      }
    };

    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(body));
  };

  // Creo el Token con el nombre y el rol (en este caso, siempre "presenter")
  createToken(nombre, "presenter", function (response) {
    var token = response;
    console.log(token);
    room = Erizo.Room({token: token});

    localStream.addEventListener("access-accepted", function () {
      var subscribeToStreams = function (streams) {
        for (var index in streams) {
          var stream = streams[index];
          if (localStream.getID() !== stream.getID()) {
            room.subscribe(stream);
          }
        }
      };

      /*** GESTIÓN DE EVENTOS DE LA ROOM ***/
      // Conexión a la room
      room.addEventListener("room-connected", function (roomEvent) {

        room.publish(localStream, {maxVideoBW: 300});
        subscribeToStreams(roomEvent.streams);
      });

      // Alguien se conecta a la misma room
      //  - Se crea el 'div' que contendrá su video y se le da estilo
      //  - Se crea el 'div' que contendrá el username
      //  - Se le pide al Stream el username
      //  - Se guarda en la lista de IDs el id del usuario
      //  - Se muestra en el div 'otrosVideos'
      room.addEventListener("stream-subscribed", function(streamEvent) {
        var stream = streamEvent.stream;
        principalNow = nombre;
        numeroConexion = "primera";

        var div = document.createElement('div');
        div.setAttribute("style", "width: 45%; height: 120px; margin: 2%; float:left; margin-top:9%;");
        var nombreUsuario = document.createElement('div');
        nombreUsuario.setAttribute("id", "nombreUsuario");

        var attrbs = stream.getAttributes();
        nombreUsuario.innerHTML = "<p style=\"margin-bottom:0px;\" class=\"text-center\">" + attrbs.name + "</p>";
        document.getElementById("userCon").innerHTML = attrbs.name;
        $("#connectedUser").show();
        div.appendChild(nombreUsuario);
        var idDiv = stream.getID();
        idStream = idDiv;

        div.setAttribute("id", "" + idDiv);
        idVideos.push(attrbs.name + ":" + idDiv + "\n");

        document.getElementById("otrosVideos").appendChild(div);
        stream.show(stream.getID()); //Muestra el vídeo del invitado
        getPrincipal();
      });

      room.addEventListener("stream-added", function (streamEvent) {
        var streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
      });

      // Alguien se desconecta de la Room
      //  - Envía el nombre del desconectado al servidor para borrarlo
      //  - Elimina el stream del DOM
      room.addEventListener("stream-removed", function (streamEvent) {
        // Remove stream from DOM
        var stream = streamEvent.stream;
        var att = stream.getAttributes();
        document.getElementById("userDiscon").innerHTML = att.name;
        $("#disconnectedUser").show();
        socket.emit('eraseName', {name: att.name});
        if (stream.elementID !== undefined) {
          //alert("in " + stream.getID());
          var element = document.getElementById("otrosVideos");
          var eraseElem = document.getElementById(stream.getID());
          element.removeChild(eraseElem);
        }

      });
      /*** FIN GESTIÓN DE EVENTOS DE LA ROOM ***/

      room.connect();
      localStream.show("videoAux");
    });

    localStream.init();
  });
};
