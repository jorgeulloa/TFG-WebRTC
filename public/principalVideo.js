//Gestión video principal

function cambiarAModoPrincipal(){
	document.getElementById("myVideo").innerHTML = "";
	document.getElementById("principalName").innerHTML = "<i class=\"icon-user\"></i> " + nombre;
	socket.emit("wantToBePrincipal", {name:nombre});
	localStream.show("myVideo");
}

socket.on("wantToBePrincipal", function(data){
	document.getElementById("myVideo").innerHTML = "";
	
	var newName = data.name;
	var newStream = room.getStreamsByAttribute("name", newName);
	document.getElementById("principalName").innerHTML = "<i class=\"icon-user\"></i> " + newName;
	newStream[0].show("myVideo");
})