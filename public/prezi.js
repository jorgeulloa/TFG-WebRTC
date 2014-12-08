var idPrezi;
var pP;
var playerPrezi;
var turnoPrezi = 0;

function loadPrezi(){
	//idVid = prompt("Pega aquí la URL del vídeo (YouTube)");
	idPrezi = document.getElementById("idPrezi").value;
	if(idPrezi == "" || idPrezi == null){
		$("#idPreziAlert").show();
		return;
	}
	//ytModeRender();
	//socket.emit('youtubeMode', {id:idVid});
	//ytVideoLoader();
	socket.emit('preziMode', {id:idPrezi});
	preziRender();
	preziLoader(idPrezi, 0);
}

function preziRender(){
	document.getElementById("idInputPrezi").setAttribute("style", "display:none;");
	document.getElementById("prezi").setAttribute("style", "display:block; margin-top:0px;");
}

function preziLoader(id, step){
	playerPrezi = new PreziPlayer('prezi-player', {
    	'preziId' : id,
    	explorable: true
	});

	player.on(PreziPlayer.EVENT_STATUS, function(event) {
	    if (event.value == PreziPlayer.STATUS_CONTENT_READY) {
	        //document.getElementById("btnNextPrezi").disabled=false;
	        //document.getElementById("btnPrevPrezi").disabled=false;
	        if (step != 0){
				playerPrezi.flyToStep(step);
			}
	    }
	});

	pP = playerPrezi;
}

function showPreziDiv(){
	document.getElementById("activeBlackboard").setAttribute("class", "");
	document.getElementById("activeYouTube").setAttribute("class", "");
	document.getElementById("activePrezi").setAttribute("class", "active");
	document.getElementById("tab1").setAttribute("class", "tab-pane");
	document.getElementById("tab2").setAttribute("class", "tab-pane");
	document.getElementById("tab3").setAttribute("class", "tab-pane active");
}

function nextStep(){
	var nxtStep = playerPrezi.getCurrentStep() + 1;
	socket.emit('preziNextStep', {step: nxtStep});
	playerPrezi.flyToStep(nxtStep);
}

function prevStep(){
	var prvStep = playerPrezi.getCurrentStep() - 1;
	if(prvStep >= 0){
		socket.emit('preziPrevStep', {step:prvStep});
		playerPrezi.flyToStep(prvStep);
	}else{
		$("idPreziAlertFirstStep").show();
	}
}

socket.on('preziNextStep', function(data){
	playerPrezi.flyToStep(data.step);
});

socket.on('preziPrevStep', function(data){
	playerPrezi.flyToStep(data.step);
});

socket.on('preziMode', function(data){
	showPreziDiv();
	preziRender();
	preziLoader(data.id, data.step);
	//playerPrezi.flyToStep(data.step);
	turnoPrezi=0;
});

socket.on('getPreziStep', function(data){
	var step = playerPrezi.getCurrentStep();
	socket.emit('setPreziStep', {step: step, turno: turnoPrezi});
	turnoPrezi++;
});