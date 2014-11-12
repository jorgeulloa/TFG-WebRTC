var layoutGeneral = 0;
var idVid;
var modoGeneral;
var rolGeneral = "otro"; //Puede ser "principal", "secundario", "otro"
var lockState = "open"; //Puede ser "open", "closed" o "closedByMe"
var streamPrincipal;
var principalNow = nombre;
var lista = new Array();

function enviaChat(){
	var txt = document.getElementById("txtChat").value;
	socket.emit('chat', { msg: txt, from: nombre });
	//document.getElementById("chatArea").value += "\nYou > " + txt;
	document.getElementById("chatArea").value = "\nYou > " + txt + document.getElementById("chatArea").value;
	document.getElementById("txtChat").value = "";
}

//SOCKET

//Gestiona entrada de mensajes de chat
socket.on('mens', function(data){
	console.log("Mensaje recibido: " + data.mens);
	//document.getElementById("chatArea").value += "\n      " + data.from + " > " + data.mens;
	document.getElementById("chatArea").value = "\n      " + data.from + " > " + data.mens + document.getElementById("chatArea").value;
});


/***********Videos YouTube***********/

socket.on('stop_yt', function(){
	console.log("Stop Video");
	player.stopVideo();
});

socket.on('pause_yt', function(){
	console.log("Pause Video");
	player.pauseVideo();
});

socket.on('play_yt', function(){
	console.log("Play Video");
	player.playVideo();
});

function appearSS(){
	document.getElementById("hideShowControl").style.display='none';
	document.getElementById("ss").style.display = 'block';
	loadPlayer();
}


/*********** Gestión del cambio a principal ***********/

function emitPrincipalRol(){
	//socket.emit('principalRol');
	toPrincipalRol();
}

function toPrincipalRol(){
	if(principalNow == nombre){
		socket.emit('wannabePrincipal', {name:nombre, id:idStream});
		document.getElementById("principalRolBtn").disabled=true;
	}else{
		document.getElementById("myVideo").innerHTML="";
		socket.emit('wannabePrincipal', {name:nombre, id:idStream});
		document.getElementById("principalRolBtn").disabled=true;
		localStream.show("myVideo");
		document.getElementById("videoAux").innerHTML="";
	}
}

function toggleLockPrincipalRol(){
	if(lockState == "open"){
		document.getElementById("imgLock").setAttribute("src", "images/closed.png");
		//toPrincipalRol();
		lockState = "closedByMe";
		socket.emit('lockClosed', {name:nombre});
	}else if(lockState == "closedByMe"){
		document.getElementById("imgLock").setAttribute("src", "images/open.png");
		document.getElementById("principalRolBtn").disabled=false;
		lockState ="open";
		socket.emit('lockOpen', {name:nombre});
	}else{
		$("#cannotOpenLock").show();
		//alert("No puedes abrir el cerrojo.");
	}
}

socket.on('newPrincipal',function(data){
	var principalName = data.name;
	var principalId = data.id;
	changeToPrincipal(principalName, principalId);
	document.getElementById("principalRolBtn").disabled=false;
});

function changeToPrincipal(principalName, principalId){
	localStream.show("videoAux");
    document.getElementById("myVideo").innerHTML="";
    //localStream.hide();
    var streamNewPrincipal = room.getStreamsByAttribute('name', principalName);
    //streamNewPrincipal[0].hide();
    streamPrincipal = streamNewPrincipal;
    streamNewPrincipal[0].show("myVideo");
    principalNow = principalName;
}


//Gestiona el candado de Principal
socket.on('lockOpen', function(){
	document.getElementById("principalRolBtn").disabled=false;
	document.getElementById("imgLock").setAttribute("src", "images/open.png");
	lockState="open";	
});

socket.on('lockClosed', function(){
	document.getElementById("principalRolBtn").disabled=true;
	document.getElementById("imgLock").setAttribute("src", "images/closed.png");
	lockState="closed";

});

socket.on('lockDisconnect', function(){
	document.getElementById("principalRolBtn").disabled=false;
	document.getElementById("imgLock").setAttribute("src", "images/open.png");
	document.getElementById("myVideo").innerHTML = "<div class='hero-unit'><small>Tip: you can press the lock to block your video stream in the principal site. Unlock it to let the other participants share their video.</small></div>";
	document.getElementById("principalName").innerHTML = "";
	lockState="open";
	
	
});

function openLock(){
	//Meter el contenido de arriba
}

function closeLock(){

}



/*********** Gestión de usuarios (lista) ***********/
socket.on('updateListaNombres', function(data){
	updateListaNombres(data.names);
	
});

function updateListaNombres(listadenombres){
	
	lista = listadenombres.split("*");
	var cmd ="";
	var i;
	for(i = 0; i < lista.length-1; i++){
		cmd += "<li id=\"" + lista[i] + "\" ><i class=\"icon-user\"></i> " + lista[i] + "</li>";
	}
	document.getElementById("listaParticipantes").innerHTML = cmd;
}

socket.on('userRemoved', function(){
	socket.emit('getListaNombres');
});


/*********** Pizarra ***********/
function changeToBlackboardMode(){
	socket.emit("blackboardMode");
}

socket.on('blackboardMode', function(){
	document.getElementById("activeBlackboard").setAttribute("class", "active");
	document.getElementById("activeYouTube").setAttribute("class", "");
	document.getElementById("tab1").setAttribute("class", "tab-pane active");
	document.getElementById("tab2").setAttribute("class", "tab-pane");
});

/*********** MISC ***********/
function changeImgAcordion(){
	var a = document.getElementById('imgAcordion');
	if(a.getAttribute("class") == "icon-chevron-down")
		a.setAttribute("class", "icon-chevron-up");
	else
		a.setAttribute("class", "icon-chevron-down");
}


