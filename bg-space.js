// bg-space.js
window.launchStarfield = function() {
  var canvas = document.getElementById("bg-space");
  var c = canvas.getContext("2d");

  canvas.style.display = "block";

  var radius = '0.' + Math.floor(Math.random() * 9) + 1;
  var focalLength = canvas.width * 2;
  var warp = 0;
  var centerX, centerY;
  var stars = [], star;
  var numStars;
  var animate = true;

  function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      return true;
    }
    return false;
  }

  function initializeStars() {
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    numStars = Math.floor(canvas.width * canvas.height * 0.00350);
    stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        o: '0.' + Math.floor(Math.random() * 99) + 1
      });
    }
  }

  function moveStars() {
    for (let i = 0; i < numStars; i++) {
      star = stars[i];
      star.z--;
      if (star.z <= 0) {
        star.z = canvas.width;
      }
    }
  }

  function drawStars() {
    if (resizeCanvasToDisplaySize(canvas)) {
      focalLength = canvas.width * 2;
      initializeStars();
      centerX = canvas.width / 2;
      centerY = canvas.height / 2;
    }

    if (warp === 0) {
      c.fillStyle = "#13131300";
      c.fillRect(0, 0, canvas.width, canvas.height);
    }

    c.fillStyle = "rgba(250, 250, 250, " + radius + ")";
    for (let i = 0; i < numStars; i++) {
      star = stars[i];
      let pixelX = (star.x - centerX) * (focalLength / star.z) + centerX;
      let pixelY = (star.y - centerY) * (focalLength / star.z) + centerY;
      let pixelRadius = 0.5 * (focalLength / star.z);
      c.fillRect(pixelX, pixelY, pixelRadius, pixelRadius);
      c.fillStyle = "rgba(250, 250, 250, " + star.o + ")";
    }
  }

  function executeFrame() {
    if (animate) requestAnimationFrame(executeFrame);
    moveStars();
    drawStars();
  }

  initializeStars();
  executeFrame();
};
