function blackboardMode(){
	socket.emit('blackboardMode');
	blackboardModeRender();
}

function blackboardModeRender(){
	var rightDiv = document.getElementById("rightDiv");
	var centerDiv = document.getElementById("centerDiv");
	var leftDi	= document.getElementById("leftDiv");
	//document.getElementById("hideShowControl").style.display = 'none';
	document.getElementById("chatArea").setAttribute('rows', 25);
	leftDiv.appendChild(document.getElementById("videoDestacado"));
	document.getElementById("paintArea").setAttribute('height', '500px');
	document.getElementById("canvasDiv").style.display = 'block';
	document.getElementById("paintArea").style.display = 'block';
	centerDiv.appendChild(document.getElementById("paintArea"));
	document.getElementById("yt").style.display = 'none';
	document.getElementById("videoDestacado").setAttribute('style', 'width:80%; text-align:center; margin:auto;');
	document.getElementById("myVideo").setAttribute('style', 'height:40%;');
	leftDiv.appendChild(document.getElementById("otrosVideos"));
	document.getElementById("otrosVideos").setAttribute('style', 'text-align:center; margin: auto;')
}

socket.on('blackboardMode', function(){
	blackboardModeRender();
})

