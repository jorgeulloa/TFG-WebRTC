/******* CANVAS *******/
var ctx;
var mouse = {x: 0, y: 0};
function initCanvas(){
canvas = document.createElement('canvas');
canvas.setAttribute('id', 'paintArea');
//canvas.setAttribute('class', 'span11');
//canvas.setAttribute('width', '100%');
//canvas.setAttribute('height', '200px');
/*var canvasW = $("canvasDiv").width();
var canvasH = document.getElementById("canvasDiv").height;
alert(canvasW);*/
canvas.setAttribute('width', '550px');
canvas.setAttribute('height', '230px');
//canvas.setAttribute('height', '200px');
var canvasDiv = document.getElementById("canvasDiv");
canvasDiv.appendChild(canvas);
ctx = canvas.getContext('2d');


 
/* Captura del puntero del raton */
canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;
  //socket.emit('drawing', {x: mouse.x, y: mouse.y});
  
}, false);

/* Especificaciones de pintado */
ctx.lineWidth = 1;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = '#eee';

/* Evento click mousedown*/
canvas.addEventListener('mousedown', function(e) {
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
 
    canvas.addEventListener('mousemove', onPaint, false);
    
}, false);

/* Evento click mouseup */ 
canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', onPaint, false);
    socket.emit('stopDrawing');
}, false);

 
var onPaint = function() {
	console.log("drawing");
	socket.emit('drawing', {x: mouse.x, y: mouse.y});
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

socket.on('draw', function(data){
	ctx.lineTo(data.x, data.y);
	ctx.stroke();
});

socket.on('stopDraw', function(){
	ctx.beginPath();
});

socket.on('clearCanvas', function(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('clearCanvas').addEventListener('click', function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	socket.emit('clearCanvas');
}, false);

function blackboardModeRender(){
  var rightDiv = document.getElementById("rightDiv");
  var centerDiv = document.getElementById("centerDiv");
  var leftDi  = document.getElementById("leftDiv");
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


socket.on('blackboardInitial', function(data){
  blackboardModeRender();
  for (var index = 0; index < data.dibujo.length; index++) {
    alert("aqui " + data.dibujo[index]);
    ctx.lineTo(data.dibujo[index].x, data.dibujo[index].y);
    ctx.stroke();
  }
});

}