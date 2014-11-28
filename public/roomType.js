function getRoomReunion(){
	document.getElementById("roomTypeButton1").setAttribute("class", "");
	document.getElementById("roomTypeButton1").setAttribute("class", "btn btn-warning");
	document.getElementById("roomTypeButton2").setAttribute("class", "");
	document.getElementById("roomTypeButton2").setAttribute("class", "btn btn-info");
    socket.emit('setRoomType', {type: false});
 }
  
 function getRoomAula(){
 	document.getElementById("roomTypeButton2").setAttribute("class", "");
	document.getElementById("roomTypeButton2").setAttribute("class", "btn btn-warning");
	document.getElementById("roomTypeButton1").setAttribute("class", "");
	document.getElementById("roomTypeButton1").setAttribute("class", "btn btn-info");
    socket.emit('setRoomType', {type: true});
 }

 socket.on('changeRoomType', function(data){
    if (data.a == 'aula'){
      document.getElementById("activeBlackboard").style.display = "none";
      document.getElementById("activeYouTube").style.display = "none";
      document.getElementById("activePrezi").style.display = "none";
    } else{
      document.getElementById("activeBlackboard").style.display = "";
      document.getElementById("activeYouTube").style.display = "";
      document.getElementById("activePrezi").style.display = "";
    }
  });

 