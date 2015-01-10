var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
var stepYoutube = 0;
var autoPlay = false;

function onYouTubeIframeAPIReady() {
player = new YT.Player('player', {
  height: '300',
  width: '90%',
  videoId: 'M7lc1UVf-VE',
  playerVars: { 'controls': 0 },
  events: {
    'onReady': onPlayerReady,
    'onStateChange': onPlayerStateChange
  }
});
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
	//event.target.playVideo();
	if (autoPlay == true){
		player.loadVideoById(idVid, minVid, "large");
		autoPlay=false;
	} else{
		player.cueVideoById(idVid, minVid, "large");
	}
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING && !done) {
	  //setTimeout(stopVideo, 6000);
	  done = true;
	}
}

function stopVideo() {
	player.stopVideo();
	socket.emit('yt_stop');
	document.getElementById("btnPlay").value="play";
	document.getElementById("btnPlay").innerHTML = "<i class=\"icon-play\"></i> Play";
}

function pauseVideo(){
	player.pauseVideo();
	socket.emit('yt_pause');
}

function playVideo(){
	//comprobar que el vídeo se ha cargado en más de un 10% en todos los clientes
	/*
		player.getVideoLoadedFraction();
	*/
	var videoState = document.getElementById("btnPlay").value;
	if(videoState == "play"){
		player.playVideo();
		socket.emit('yt_play');
		document.getElementById("btnPlay").value="pause";
		document.getElementById("btnPlay").innerHTML = "<i class=\"icon-pause\"></i> Pause";
	}else{
		player.pauseVideo();
		socket.emit('yt_pause');
		document.getElementById("btnPlay").value="play";
		document.getElementById("btnPlay").innerHTML = "<i class=\"icon-play\"></i> Play";
	}
}

function changeVideo(){
	document.getElementById("yt").style.display = 'none';
	document.getElementById("idInput").style.display = 'block';
	player.stopVideo();
}

function appearYTVideo(){
	idVid = document.getElementById("idVideo").value;	
	document.getElementById("hideShowControl").style.display='none';
	document.getElementById("yt").style.display = 'block';
}

/*
 * Cambia los modos
 * Carga el vídeo
 */

function loadYTVideo(){
	//idVid = prompt("Pega aquí la URL del vídeo (YouTube)");
	idVid = document.getElementById("idVideoYT").value;
	minVid = 0;
	if(idVid == "" || idVid == null){
		$("#idYouTubeAlert").show();
		return;
	}
	ytModeRender();
	socket.emit('youtubeMode', {id:idVid});
	ytVideoLoader();
}

function ytModeRender(){
	document.getElementById("idInput").setAttribute("style", "display:none;");
	document.getElementById("yt").setAttribute("style", "display:block; margin-top:0px;");

}

function ytVideoLoader(){
	player.loadVideoById(idVid, minVid, 'large');
	player.playVideo();
}

function showYTdiv(){
	document.getElementById("activeBlackboard").setAttribute("class", "");
	document.getElementById("activePrezi").setAttribute("class", "");
	document.getElementById("activeYouTube").setAttribute("class", "active");
	document.getElementById("tab1").setAttribute("class", "tab-pane");
	document.getElementById("tab3").setAttribute("class", "tab-pane");
	document.getElementById("tab2").setAttribute("class", "tab-pane active");
}

socket.on('youtubeMode', function(data){
	if (stepYoutube == 0){
		if (data.min != null){
			idVid = data.id;
			minVid = data.min;

			autoPlay = true;

		}else{
			idVid = data.id;
			minVid = 0;
		}
		showYTdiv();
		ytModeRender();
		ytVideoLoader();
	}
	stepYoutube = 0;
	
});

socket.on('getMinuto', function(){
	var minutos = player.getCurrentTime();
	socket.emit('setMinuto', {min: minutos, step: stepYoutube});
	stepYoutube++;

});