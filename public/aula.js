
function loadClassView(){
	socket.emit("loadClassView");
	loadClassViewNow();
}

function loadClassViewNow(){
	document.getElementById("principalControls").style.display="block";
	document.getElementById("supMenuDebate").setAttribute("class", "");
	document.getElementById("supMenuIndex").setAttribute("class", "active");
	document.getElementById("moduleArea").style.display="block";
	document.getElementById("chronoArea").style.display="none";
	document.getElementById("debateControlPanel").style.display="none";
	document.getElementById("pideTurno").style.display="none";
}

socket.on("loadClassView", function(){
	loadClassViewNow();
});