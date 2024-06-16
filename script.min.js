<script>
const IMAGE_BASE64 = "https://raw.githubusercontent.com/Cosmogeeko/RETRO-MECHA/main/NM-SP01.png";
const PARTICLE_SIZE = 23; // taille en pixels de l'image
const DEFAULT_REPULSION_CHANGE_DISTANCE = 150;

const CLICK_TIMEOUT = 900; // 300ms de temporisation entre les interactions
let canInteract = true;

let repulsionChangeDistance = DEFAULT_REPULSION_CHANGE_DISTANCE;
let pointSystem = null;
let targetImage = null;

let touchX = 0;
let touchY = 0;
let isTouching = false;
let isMouseDown = false;

// ==================================================
// ImageParticle Class
// ==================================================
class ImageParticle {
  constructor(originPosition, originScale, originColor) {
    this.position = originPosition.copy();
    this.originPosition = originPosition.copy();
    this.velocity = createVector(random(0, 50), random(0, 50));
    this.repulsion = random(1.0, 5.0);
    this.mouseRepulsion = 1.0;
    this.gravity = 0.01;
    this.maxGravity = random(0.01, 0.04);
    this.scale = originScale;
    this.originScale = originScale;
    this.color = originColor;
    this.sprite = null;
  }

  createSprite(texture) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.tint = (this.color[0] << 16) + (this.color[1] << 8) + (this.color[2]);
    return this.sprite;
  }

  updateState() {
    this._updateStateByMouse();
    this._updateStateByOrigin();
    this.velocity.mult(0.95);
    this.position.add(this.velocity);
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;
    this.sprite.scale.x = this.sprite.scale.y = this.scale;
  }

  _updateStateByMouse() {
    if (!isMouseDown && !isTouching) {
      return;
    }

    let distanceX, distanceY, distance;
    
    if (isTouching) {
      distanceX = touchX - this.position.x;
      distanceY = touchY - this.position.y;
    } else if (isMouseDown) {
      distanceX = mouseX - this.position.x;
      distanceY = mouseY - this.position.y;
    } else {
      return;
    }
    
    distance = mag(distanceX, distanceY);
    const pointCos = distanceX / distance;
    const pointSin = distanceY / distance;

    if (distance < repulsionChangeDistance) {
      this.gravity *= 0.6;
      this.mouseRepulsion = max(0, this.mouseRepulsion * 0.5 - 0.01);
      this.velocity.sub(pointCos * this.repulsion, pointSin * this.repulsion);
      this.velocity.mult(1 - this.mouseRepulsion);
    } else {
      this.gravity += (this.maxGravity - this.gravity) * 0.1;
      this.mouseRepulsion = min(1, this.mouseRepulsion + 0.03);
    }
  }

  _updateStateByOrigin() {
    const distanceX = this.originPosition.x - this.position.x;
    const distanceY = this.originPosition.y - this.position.y;
    const distance = mag(distanceX, distanceY);
    this.velocity.add(distanceX * this.gravity, distanceY * this.gravity);
    this.scale = this.originScale + this.originScale * distance / 512;
  }

  returnToOrigin() {
    const distanceX = this.originPosition.x - this.position.x;
    const distanceY = this.originPosition.y - this.position.y;
    this.velocity.add(distanceX * 0.1, distanceY * 0.1);
  }
}

// ==================================================
// ImageParticleSystem Class
// ==================================================
class ImageParticleSystem {
  constructor() {
    this.points = [];
    this.pointSprites = [];
    const viewport = document.getElementById("viewport");
    this.renderer = PIXI.autoDetectRenderer(viewport.clientWidth, viewport.clientHeight, {
      view: viewport,
      transparent: true // Set the renderer à transparent
    });
    this.stage = new PIXI.Container();
    this.container = new PIXI.Container();
    this._createParticles();
    this._setup();
  }

  _setup() {
    this.stage.addChild(this.container);
    document.body.appendChild(this.renderer.view);
  }

  _getPixel(x, y) {
    const pixels = targetImage.pixels;
    const idx = (y * targetImage.width + x) * 4;
    if (x > targetImage.width || x < 0 || y > targetImage.height || y < 0) {
      return [0, 0, 0, 0];
    }
    return [
      pixels[idx + 0],
      pixels[idx + 1],
      pixels[idx + 2],
      pixels[idx + 3]
    ];
  }

  _createParticleTexture() {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(0);
    graphics.beginFill(0xFFFFFF);
    graphics.drawRect(0, 0, PARTICLE_SIZE, PARTICLE_SIZE);
    return graphics.generateTexture();
  }

  _createParticles() {
    const imageWidth = targetImage.width;
    const imageHeight = targetImage.height;
    const viewport = document.getElementById("viewport");
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const imageScale = Math.min(viewportWidth / imageWidth, viewportHeight / imageHeight);
    const texture = this._createParticleTexture();
    const fractionSizeX = Math.ceil(imageWidth / PARTICLE_SIZE);
    const fractionSizeY = Math.ceil(imageHeight / PARTICLE_SIZE);

    const offsetX = (viewportWidth - (imageWidth * imageScale)) / 2;
    const offsetY = (viewportHeight - (imageHeight * imageScale)) / 2;

    for (let i = 0; i < fractionSizeX; i++) {
      for (let j = 0; j < fractionSizeY; j++) {
        const imagePosition = createVector(i * PARTICLE_SIZE, j * PARTICLE_SIZE);
        let originColor = this._getPixel(imagePosition.x, imagePosition.y);
        if (originColor[3] === 0) {
          continue;
        }
        let originPosition = imagePosition.copy().mult(imageScale).add(offsetX, offsetY);
        let originScale = imageScale;
        let point = new ImageParticle(originPosition, originScale, originColor);
        this.points.push(point);
        this.container.addChild(point.createSprite(texture));
      }
    }

    console.log("particle count: %s", this.points.length);
  }

  updateState() {
    const mousePosition = this.renderer.plugins.interaction.mouse.global;
    mouseX = mousePosition.x;
    mouseY = mousePosition.y;
    for (let point of this.points) {
      point.updateState();
    }

    if (!isMouseDown && !isTouching) {
      for (let point of this.points) {
        point.returnToOrigin();
      }
    }
  }

  render() {
    this.renderer.render(this.stage);
  }
}

// ==================================================
// Main
// ==================================================
function preload() {
  targetImage = loadImage(IMAGE_BASE64);
}

function setup() {
  targetImage.loadPixels();
  noStroke();
  frameRate(60);
  pointSystem = new ImageParticleSystem();
  setupEvents();
}

function draw() {
  repulsionChangeDistance = max(0, repulsionChangeDistance - 1.5);
  pointSystem.updateState();
  pointSystem.render();
}

function setupEvents() {
  const canvas = document.getElementById('viewport');

  const onMouseMove = (e) => {
    if (isMouseDown) {
      touchX = e.offsetX;
      touchY = e.offsetY;
      repulsionChangeDistance = DEFAULT_REPULSION_CHANGE_DISTANCE;
    }
  };

  const onMouseDown = (e) => {
    if (e.button === 0 && canInteract) { // left mouse button and can interact
      isMouseDown = true;
      touchX = e.offsetX;
      touchY = e.offsetY;
      repulsionChangeDistance = DEFAULT_REPULSION_CHANGE_DISTANCE;
      canInteract = false;
      setTimeout(() => canInteract = true, CLICK_TIMEOUT);
    }
  };

  const onMouseUp = (e) => {
    if (e.button === 0) { // left mouse button
      isMouseDown = false;
      repulsionChangeDistance = 0;
    }
  };

  const onTouchStartMove = (e) => {
    if (canInteract) {
      isTouching = true;
      const touch = e.touches[0];
      const { x, y } = getRelativeTouchCoordinates(touch);
      touchX = x;
      touchY = y;
      repulsionChangeDistance = DEFAULT_REPULSION_CHANGE_DISTANCE;
      canInteract = false;
      setTimeout(() => canInteract = true, CLICK_TIMEOUT);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    isTouching = false;
    repulsionChangeDistance = 0;
  };

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseUp); // handle case when mouse leaves the canvas

  canvas.addEventListener('touchstart', onTouchStartMove);
  canvas.addEventListener('touchmove', onTouchStartMove);
  canvas.addEventListener('touchend', onTouchEnd);
  canvas.addEventListener('touchcancel', onTouchEnd);
}

function getRelativeTouchCoordinates(touch) {
  const canvas = document.getElementById('viewport');
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY
  };
}

////////////////////////////////////////////////////////////////////////

class Symbol {
  characters;
  x;
  y;
  fontSize;
  text;
  canvasHeight;
  fontStyle;
  constructor(x, y, fontSize, canvasHeight, fontStyle = 'Press Start 2P') {
    this.characters = "ᚠ ᚡ ᚢ ᚣ ᚤ ᚥ ᚦ ᚧ ᚨ ᚩ ᚪ ᚫ ᚬ ᚭ ᚮ ᚯ ᚰ ᚱ ᚲ ᚳ ᚴ ᚵ ᚶ ᚷ ᚸ ᚹ ᚺ ᚻ ᚼ ᚽ ᚾ ᚿ ᛀ ᛁ ᛂ ᛃ ᛄ ᛅ ᛆ ᛇ ᛈ ᛉ ᛊ ᛋ ᛌ ᛍ ᛎ ᛏ ᛐ ᛑ ᛒ ᛓ ᛔ ᛕ ᛖ ᛗ ᛘ ᛙ ᛚ ᛛ ᛜ ᛝ ᛞ ᛟ ᛠ ᛡ ᛢ ᛣ ᛤ ᛥ ᛦ ᛧ ᛨ ᛩ ᛪ";
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.text = "A";
    this.canvasHeight = canvasHeight;
    this.fontStyle = fontStyle;
  }
  draw(context) {
    context.font = `${this.fontSize}px '${this.fontStyle}'`;
    this.text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);
    if (this.y * this.fontSize > this.canvasHeight && Math.random() > 0.97) {
      this.y = 0;
    } else {
      this.y += 0.9;
    }
  }
}

class Effect {
    fontSize;
    canvasWidth;
    canvasHeight;
    columns;
    symbols;
    fontStyle;
    constructor(canvasWidth, canvasHeight, fontStyle = 'Press Start 2P') {
      this.fontSize = calculateFontSize(6, canvasWidth, canvasHeight); // Pass canvas dimensions
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.columns = this.canvasWidth / this.fontSize;
      this.symbols = [];
      this.fontStyle = fontStyle;
      this.initialize();
    }
    initialize() {
      for (let i = 0; i < this.columns; i++) {
        this.symbols[i] = new Symbol(i, 0, this.fontSize, this.canvasHeight, this.fontStyle);
      }
    }
    resize(width, height) {
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.fontSize = calculateFontSize(6, this.canvasWidth, this.canvasHeight); // Recalculate with new canvas dimensions
      this.columns = this.canvasWidth / this.fontSize;
      this.symbols = [];
      this.initialize();
    }
  }

  class Matrix {
    last = 0;
    fps = 26;
    timer = 0;
    canvas;
    ctx;
    effect;
    nextFrame;
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = canvas.clientWidth;
      this.canvas.height = canvas.clientHeight;
      this.effect = new Effect(this.canvas.width, this.canvas.height, 'Press Start 2P');
      this.nextFrame = 1000 / this.fps;
      this.timer = 0;
    }
    width(w) {
      this.canvas.width = w;
    }
    height(h) {
      this.canvas.height = h;
    }
    resize() {
      this.effect.resize(this.canvas.width, this.canvas.height);
    }
  }

  function calculateFontSize(vmin, canvasWidth, canvasHeight) {
    return (Math.min(canvasWidth, canvasHeight) * vmin) / 100;
  }

const canvas = document.getElementById("matrix");
const matrix = new Matrix(canvas);

const animate = (time) => {
  const deltaTime = time - matrix.last;
  matrix.fps = time;
  if (matrix.timer > matrix.nextFrame) {
    matrix.ctx.textAlign = "center";
    matrix.ctx.fillStyle = "#7d2d310d";
    matrix.ctx.fillRect(0, 0, matrix.canvas.width, matrix.canvas.height);
    matrix.ctx.font = `${matrix.effect.fontSize}px 'Press Start 2P'`;
    matrix.ctx.fillStyle = "#000000";
    matrix.ctx.fillStyle = "#000000";

    matrix.effect.symbols.forEach((symbol) => symbol.draw(matrix.ctx));
    matrix.timer = 0;
  } else {
    matrix.timer += deltaTime;
  }
  requestAnimationFrame(animate);
};

animate(0);
  window.addEventListener("resize", function () {
    matrix.width(viewportCanvas.clientWidth);
    matrix.height(viewportCanvas.clientHeight);
    matrix.resize();
});
</script>