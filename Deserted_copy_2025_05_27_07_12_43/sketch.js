// Ghost Chase Game - All Sizes Increased
let character, ghost;
let bImg, cImg;
let oImg1, oImg2, oImg3, oImg4, oImg5, oImg6;
let obstacles = [];
let coins = [];
let gems = [];
let gravity = 0.8;
let jumpStrength = -15;
let groundY;
let gameState = "menu";
let score = 0;
let coinsCollected = 0;
let gemsCollected = 0;
let level = 1;
let obstacleSpawnInterval = 1500;
let lastObstacleSpawn = 0;

let maxJumps = 2;
let jumpCount = 0;
let ghostStartTime = 0;

let bgX = 0;
let bgScrollSpeed = 2;

function preload() {
  bImg = loadImage('assets/Background.jpg');
  cImg = loadImage('assets/Character.png');
  oImg1 = loadImage('assets/obstacle1.png');
  oImg2 = loadImage('assets/obstacle2.png');
  oImg3 = loadImage('assets/obstacle3.png');
  oImg4 = loadImage('assets/obstacle4.png');
  oImg5 = loadImage('assets/obstacle5.png');
  oImg6 = loadImage('assets/obstacle6.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  groundY = height - 50;

  character = { x: 100, y: groundY, w: 60, h: 90, ySpeed: 0, xSpeed: 0 };
  ghost = { x: 30, y: groundY + 10, w: 60, h: 90, speed: 0 };
}

function draw() {
  bgX -= bgScrollSpeed;
  if (bgX <= -width) bgX = 0;
  image(bImg, bgX, 0, width, height);
  image(bImg, bgX + width, 0, width, height);

  if (gameState === "menu") return drawMenu();
  if (gameState === "gameover") return drawGameOver();

  score++;
  fill(0);
  textSize(18);
  textAlign(LEFT);
  text(`Score: ${score}`, 20, 30);
  text(`Coins: ${coinsCollected}`, 20, 50);
  text(`Gems: ${gemsCollected}`, 20, 70);
  text(`Level: ${level}`, 20, 90);

  character.x += character.xSpeed;
  character.x = constrain(character.x, 0, width - character.w);
  image(cImg, character.x, character.y - character.h, character.w, character.h);
  character.ySpeed += gravity;
  character.y += character.ySpeed;
  if (character.y > groundY) {
    character.y = groundY;
    character.ySpeed = 0;
    jumpCount = 0;
  }

  if (millis() - lastObstacleSpawn > obstacleSpawnInterval) {
    obstacles.push(createRandomObstacle());
    lastObstacleSpawn = millis();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= 6 + level * 0.5;
    image(obs.img, obs.x, obs.y - obs.h, obs.w, obs.h);

    if (rectOverlap(character.x, character.y - character.h, character.w, character.h, obs.x, obs.y - obs.h, obs.w, obs.h)) {
      gameState = "gameover";
    }
    if (obs.x + obs.w < 0) obstacles.splice(i, 1);
  }

  if (coins.length < 3 && random(1) < 0.01) {
    let coinY = groundY - 60 - random(0, 50);
    coins.push({ x: width, y: coinY, w: 20, h: 20 });
  }

  fill(255, 215, 0);
  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    coin.x -= 4 + level * 0.3;
    ellipse(coin.x + coin.w / 2, coin.y + coin.h / 2, coin.w, coin.h);

    if (character.x < coin.x + coin.w && character.x + character.w > coin.x &&
        character.y - character.h < coin.y + coin.h && character.y > coin.y) {
      coins.splice(i, 1);
      coinsCollected++;
      score += 50;
      checkLevelUp();
    } else if (coin.x + coin.w < 0) {
      coins.splice(i, 1);
    }
  }

  if (gems.length < 2 && random(1) < 0.005) {
    let gemY = groundY - 80 - random(0, 60);
    gems.push({ x: width, y: gemY, w: 25, h: 25 });
  }

  fill(0, 255, 255);
  for (let i = gems.length - 1; i >= 0; i--) {
    let gem = gems[i];
    gem.x -= 5 + level * 0.4;
    push();
    translate(gem.x + gem.w / 2, gem.y + gem.h / 2);
    rotate(PI / 4);
    rectMode(CENTER);
    rect(0, 0, gem.w, gem.h);
    pop();

    if (character.x < gem.x + gem.w && character.x + character.w > gem.x &&
        character.y - character.h < gem.y + gem.h && character.y > gem.y) {
      gems.splice(i, 1);
      gemsCollected++;
      score += 150;
      checkLevelUp();
    } else if (gem.x + gem.w < 0) {
      gems.splice(i, 1);
    }
  }

  if (ghost.speed === 0 && millis() - ghostStartTime > 10000) {
    ghost.speed = 2 + (level - 1) * 0.5;
  }

  drawGhost();

  if (ghost.speed > 0) {
    if (ghost.x < character.x) ghost.x += ghost.speed;
    else if (ghost.x > character.x) ghost.x -= ghost.speed;
  }

  if (ghost.speed > 0 &&
      rectOverlap(character.x, character.y - character.h, character.w, character.h, ghost.x, ghost.y - ghost.h, ghost.w, ghost.h)) {
    gameState = "gameover";
  }
}

function createRandomObstacle() {
  let imgOptions = [oImg1, oImg2, oImg3];
  let chosenImg = random(imgOptions);
  let scale = 0.45;
  let w = chosenImg.width * scale;
  let h = chosenImg.height * scale;

  return {
    x: width,
    y: groundY,
    w: w,
    h: h,
    img: chosenImg
  };
}

function drawGhost() {
  push();
  noStroke();
  fill(255);
  ellipse(ghost.x + ghost.w / 2, ghost.y - ghost.h / 2, ghost.w, ghost.h);
  let segments = 3;
  let segmentWidth = ghost.w / segments;
  for (let i = 0; i < segments; i++) {
    ellipse(ghost.x + segmentWidth / 2 + i * segmentWidth, ghost.y, segmentWidth, segmentWidth);
  }
  fill(0);
  ellipse(ghost.x + ghost.w * 0.3, ghost.y - ghost.h * 0.4, 8, 12);
  ellipse(ghost.x + ghost.w * 0.7, ghost.y - ghost.h * 0.4, 8, 12);
  pop();
}

function keyPressed() {
  if (gameState === "menu" && key === ' ') {
    resetGame();
    gameState = "play";
  } else if (gameState === "gameover") {
    resetGame();
    gameState = "play";
  } else if (gameState === "play") {
    if (keyCode === UP_ARROW && jumpCount < maxJumps) {
      character.ySpeed = jumpStrength;
      jumpCount++;
    }
    if (keyCode === LEFT_ARROW) character.xSpeed = -5;
    if (keyCode === RIGHT_ARROW) character.xSpeed = 5;
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) character.xSpeed = 0;
}

function resetGame() {
  character.x = 100;
  character.y = groundY;
  character.ySpeed = 0;
  character.xSpeed = 0;
  jumpCount = 0;

  ghost.x = 30;
  ghost.speed = 0;
  ghostStartTime = millis();

  obstacles = [];
  coins = [];
  gems = [];

  score = 0;
  coinsCollected = 0;
  gemsCollected = 0;
  level = 1;
  obstacleSpawnInterval = 1500;
  lastObstacleSpawn = 0;
}

function checkLevelUp() {
  let totalCollectibles = coinsCollected + gemsCollected;
  if (totalCollectibles > 0 && totalCollectibles % 20 === 0 && level < 3) {
    level++;
    ghost.speed += 0.5;
    obstacleSpawnInterval = max(600, obstacleSpawnInterval - 100);
  }
  if (score >= 2000 && level < 3) {
    level = 3;
    ghost.speed = 0;
  }
}

function drawMenu() {
  background(bImg);
  fill(0);
  textAlign(CENTER);
  textSize(48);
  text("Ghost of Miranda", width / 2, height / 2 - 80);
  textSize(20);
  text("Collect coins and gems, avoid obstacles and the ghost!", width / 2, height / 2 - 40);
  text("Use ← → to move, ↑ to jump (double jump enabled)", width / 2, height / 2 - 10);
  text("Press SPACE to Start", width / 2, height / 2 + 30);
}

function drawGameOver() {
  background(bImg);
  fill(255, 0, 0);
  textAlign(CENTER);
  textSize(50);
  text("Game Over", width / 2, height / 2 - 60);
  textSize(24);
  fill(255);
  text(`Final Score: ${score}`, width / 2, height / 2 - 20);
  text(`Coins Collected: ${coinsCollected}`, width / 2, height / 2 + 10);
  text(`Gems Collected: ${gemsCollected}`, width / 2, height / 2 + 40);
}

function rectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 < x2 || x1 > x2 + w2 || y1 + h1 < y2 || y1 > y2 + h2);
}
