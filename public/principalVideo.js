//Gestión video principal

function cambiarAModoPrincipal(){

	document.getElementById("myVideo").innerHTML = "";
	document.getElementById("principalName").innerHTML = "<i class=\"icon-user\"></i> " + nombre;
	document.getElementById("principalRolBtn").disabled=true;
    document.getElementById("divPrincipalName").style.display = "block !important";
	socket.emit("wantToBePrincipal", {name:nombre});
	localStream.show("myVideo");

}

socket.on("wantToBePrincipal", function(data){
	document.getElementById("myVideo").innerHTML = "";
	alert(data.name);
	var newName = data.name;
	var newStream = room.getStreamsByAttribute("name", newName);
	document.getElementById("principalName").innerHTML = "<i class=\"icon-user\"></i> " + newName;
	document.getElementById("principalRolBtn").disabled=false;
    document.getElementById("divPrincipalName").style.display = "block !important";
	newStream[0].show("myVideo");
})