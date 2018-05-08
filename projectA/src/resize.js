var can = document.getElementById("webgl");

function resizeCanvas() {
  can.style.width = window.innerWidth + "px";
  setTimeout(function() {
    can.style.height = window.innerHeight + "px";
  }, 0);
};

window.onresize = resizeCanvas;
resizeCanvas();
