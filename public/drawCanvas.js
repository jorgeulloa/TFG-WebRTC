/******* CANVAS *******/
var ctx;
var mouse = {x: 0, y: 0};
var lastx;
var lasty;
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
  lastx = data.x;
  lasty = data.y;
    
    if (lastx == "salto" && lasty == "salto"){
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    } else{
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }
  
	
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


}