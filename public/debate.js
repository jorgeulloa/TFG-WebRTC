var moderatorPrincipal = "[name]";
var listaTurnoPedido = new Array();

function loadDebate(){
	/*var loadDebate = confirm("¿Seguro que quieres iniciar un debate?")
	if (loadDebate == true){
		loadDebateView();
	}*/
	loadDebateView();
}

function loadDebateView(){
	document.getElementById("principalControls").style.display="none";
	document.getElementById("supMenuIndex").setAttribute("class", "");
	document.getElementById("supMenuDebate").setAttribute("class", "active");
	document.getElementById("moduleArea").style.display="none";
	document.getElementById("chronoArea").style.display="block";
	document.getElementById("debateControlPanel").style.display="block";
	document.getElementById("pideTurno").style.display="none";
	moderatorPrincipal = nombre;
	viewChrono();
	sendDebateCall();
		socket.emit('getListaNombres');
}

function sendDebateCall(){
	document.getElementById("moderatorName").innerHTML="Moderator: <strong>" + moderatorPrincipal.toUpperCase() + "</strong>";
	var startTime = document.getElementById("durationDebate").value;
	socket.emit("debateNow", {moderator: moderatorPrincipal, startTime: startTime});
}

//TIMER
var counter;

function startTimer(){
	counter=setInterval(timer,1000);
	document.getElementById("btnStartTimer").innerHTML="Stop Timer";
	document.getElementById("btnStartTimer").setAttribute("onclick", "javascript:stopTimer();");
	sendStartTimers();
}

function stopTimer(){
	clearInterval(counter);
	document.getElementById("btnStartTimer").innerHTML="Start Timer";
	document.getElementById("btnStartTimer").setAttribute("onclick", "javascript:startTimer();");
	sendStopTimers();
}

function resetTimer(){
	count = document.getElementById("durationDebate").value;
	stopTimer();
	viewChrono();
	sendResetTimers();
	document.getElementById("timer").setAttribute("style", "color:black; font-size:40px;");
}

var count = document.getElementById("durationDebate").value;

function timer()
{  
  count=count-1;
  if(count < 10)
  {
  	document.getElementById("timer").setAttribute("style", "font-size:40px; color:red;");
  }
  if (count <= 0)
  {
     clearInterval(counter);
     //counter ended, do something here
     document.getElementById("timer").setAttribute("style", "font-size:40px; color:black;");
     document.getElementById("timer").innerHTML="00 ";
     limpiaListaTurnoPedido();
     return;
  }

  document.getElementById("timer").innerHTML = "<bold>" + count + "</bold>" + " ";
}

function updateDebateDuration(){
	count = document.getElementById("durationDebate").value;
	resetTimer();
	sendUpdateTimers();
}

function viewChrono(){
	document.getElementById("timer").innerHTML = "<bold>" + count + "</bold>" + " ";
}

socket.on('debateNow', function(data){
	document.getElementById("moderatorNameAlert").innerHTML=data.moderator;
	$("#newModerator").show();
	//alert("el moderador es: " + data.moderator + data.startTime);
	moderatorPrincipal = data.moderator;
	count = data.startTime;
	changeToDebateMode();
});

function changeToDebateMode(){
	document.getElementById("supMenuIndex").setAttribute("class", "");
	document.getElementById("supMenuDebate").setAttribute("class", "active");
	document.getElementById("moduleArea").style.display="none";
	document.getElementById("chronoArea").style.display="block";
	document.getElementById("principalControls").style.display="none";
	viewChrono();
	
	document.getElementById("moderatorName").innerHTML = "Moderator: <strong>" + moderatorPrincipal.toUpperCase() + "</strong>";
}

function sendStartTimers(){
	time=document.getElementById("durationDebate").value;
	socket.emit("startTimers", {startTime: time});
}

function sendStopTimers(){
	socket.emit("stopTimers");
}

function sendResetTimers(){
	socket.emit("resetTimers");
}

function sendUpdateTimers(){
	var newTime = document.getElementById("durationDebate").value;
	socket.emit("updateTimers", {newTime: newTime});
}

socket.on("startTimers", function(data){
	counter=setInterval(timer,1000);
	//count=data.startTime;
	document.getElementById("btnStartTimer").innerHTML="Stop Timer";
	document.getElementById("btnStartTimer").setAttribute("onclick", "javascript:stopTimer();");
});

socket.on("stopTimers", function(){
	clearInterval(counter);
	document.getElementById("btnStartTimer").innerHTML="Start Timer";
	document.getElementById("btnStartTimer").setAttribute("onclick", "javascript:startTimer();");
});

socket.on("resetTimers", function(){

});

socket.on("updateTimers", function(data){
	count = data.newTime;
	stopTimer();
	viewChrono();
	document.getElementById("timer").setAttribute("style","color:black; font-size:40px;");
});

socket.on("updateListaNombres", function(data){
	var listaNombres = data.names;

	var lista = new Array();
	lista = listaNombres.split("*");
	var cmd ="";
	var i;
	for(i = 0; i < lista.length-1; i++){
		cmd += "<option>" + lista[i] + "</option>";
	}
	document.getElementsByClassName("selectNamesList")[0].innerHTML = cmd;
});

function pideTurno(){
	socket.emit("pideTurno", {name:nombre});
}

socket.on("pideTurno", function(data){
	var pideTurno = data.name;
	listaTurnoPedido.push(data.name);
	//alert("" + pideTurno + " está pidiendo turno");
	document.getElementById(""+pideTurno).setAttribute("style", "color:red;");
	document.getElementById("btnQuitaTurno").disabled=false;
});

function limpiaListaTurnoPedido(){
	var i;
	for(i = 0; i < listaTurnoPedido.length-1; i++){
		document.getElementById(""+lista[i]).setAttribute("style", "color:black;");
	}
	listaTurnoPedido = new Array();
}

function quitaTurno(){
	socket.emit("quitaTurno", {name:nombre});
}

socket.on("quitaTurno", function(data){
	var name = data.name;
	var index = listaTurnoPedido.indexOf(name);
	if(index > -1)
		listaTurnoPedido.splice(index, 1);
	document.getElementById(""+name).setAttribute("style", "color:black;")
	document.getElementById("btnQuitaTurno").disabled=true;
});

socket.on("changePrincipalDebate", function(data){
	if(data.name!=nombre)
	{
		setPrincipalVideoDebate(data.name);	
	}
	
})


function videoDebateChangeNow(){


	var nextName = document.getElementsByClassName("selectNamesList")[0].value;
	socket.emit("videoDebateChange", {name:nextName});
	videoDebateChange(nextName);
}

socket.on("videoDebateChange", function(data){
	videoDebateChange(data.name);
});

function videoDebateChange(newVideoDebate){
	/*var divTemp = document.getElementById("myVideo");

	if(newVideoDebate == nombre){
		if(divTemp.hasChildNodes()){
			var i = 0;
			for(i;i < divTemp.children.length; i++){
				divTemp.children[i].style.display="none";
			}

		localStream.show("myVideo");

		}else{
			localStream.show("myVideo");
		}
	}else{
		if(divTemp.hasChildNodes()){
			var i = 0;
			for(i;i < divTemp.children.length; i++){
				divTemp.children[i].style.display="none";
			}

		var streamNewPrincipal = room.getStreamsByAttribute('name', newVideoDebate);
		streamNewPrincipal[0].show("myVideo");

		}else{
			var streamNewPrincipal = room.getStreamsByAttribute('name', newVideoDebate);
			streamNewPrincipal[0].show("myVideo");
		}*/

	var newName = newVideoDebate;
	document.getElementById("myVideo").innerHTML="";
	document.getElementById("principalName").innerHTML = "<i class=\"icon-user\"></i> " + newName;
	if(newName == nombre){
		localStream.show("myVideo");
	}else{
		var newStream = room.getStreamsByAttribute("name", newName);
		newStream[0].show("myVideo");
	}
}