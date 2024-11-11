const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

// inicijalne postavke igre - broj redova, stupaca i brzina loptice
let gameConfig = {
  brickRowCount: 5,
  brickColumnCount: 8,
  ballSpeed: 4
}

let score = 0 // trenutni rezultat
let highScore = localStorage.getItem('highScore') || 0 // najviši rezultat pohranjen u local storage
let gameOver = false // flag za označavanje kraja igre

// postavljanje veličine canvasa prema veličini prozora
canvas.width = window.innerWidth - 10
canvas.height = window.innerHeight - 10

// varijable za objekte igre
let ball, paddle, bricks
let leftPressed = false
let rightPressed = false

// funkcija koja pokreće igru kada korisnik pritisne "Pokreni igru"
function startGame() {
  document.getElementById("config").style.display = "none" // sakrij postavke
  document.getElementById("gameTitle").style.display = "none" // sakrij naslov igre
  
  // postavljanje postavki igre na temelju korisničkog unosa
  gameConfig.brickRowCount = parseInt(document.getElementById("brickRows").value)
  gameConfig.brickColumnCount = parseInt(document.getElementById("brickColumns").value)
  gameConfig.ballSpeed = parseInt(document.getElementById("ballSpeed").value)

  initializeGame() // inicijalizacija igre
  draw() // započni crtanje igre
}

// inicijalizacija objekata igre - postavlja lopticu, palicu i cigle
function initializeGame() {
  score = 0
  gameOver = false

  // postavljanje početnih parametara loptice
  ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10,
    speedX: Math.cos(Math.random() * Math.PI / 3 + Math.PI / 3) * gameConfig.ballSpeed, 
    speedY: -Math.sin(Math.random() * Math.PI / 3 + Math.PI / 3) * gameConfig.ballSpeed,
    color: "#ff9800"
  }

  // postavljanje početnih parametara palice
  paddle = {
    height: 10,
    width: 150,
    x: (canvas.width - 150) / 2,
    color: "#3498db"
  }

  // kreiranje cigli
  bricks = []
  const brickWidth = (canvas.width - (gameConfig.brickColumnCount + 1) * 10) / gameConfig.brickColumnCount
  for (let c = 0; c < gameConfig.brickColumnCount; c++) {
    bricks[c] = []
    for (let r = 0; r < gameConfig.brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 }
    }
  }
}

// event listeneri za praćenje pritiska tipki za kretanje palice lijevo i desno
document.addEventListener("keydown", (e) => {
  if (gameOver) {
    if (e.key === "r" || e.key === "R") startGame() // ponovno pokretanje igre
    else if (e.key === "c" || e.key === "C") showConfigScreen() // povratak na postavke
  } else {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true
  }
})

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false
})

// prikaz ekrana s postavkama igre
function showConfigScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height) // očisti ekran
  document.getElementById("config").style.display = "block" // prikaži postavke
  document.getElementById("gameTitle").style.display = "block" // prikaži naslov igre
}

// prikaz "game over" poruke kad igrač izgubi
function drawGameOver(message) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = "48px Arial"
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  ctx.fillText(message, canvas.width / 2, canvas.height / 2)

  ctx.font = "24px Arial"
  ctx.fillText("Press 'R' to restart or 'C' to open settings", canvas.width / 2, canvas.height / 2 + 40)
}

// funkcija koja crta cigle na vrhu ekrana
function drawBricks() {
  const brickWidth = (canvas.width - (gameConfig.brickColumnCount + 1) * 10) / gameConfig.brickColumnCount
  const brickHeight = 20
  const brickPadding = 10
  const brickOffsetTop = 30

  for (let c = 0; c < gameConfig.brickColumnCount; c++) {
    for (let r = 0; r < gameConfig.brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + 10
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
        bricks[c][r].x = brickX
        bricks[c][r].y = brickY
        ctx.beginPath()
        ctx.rect(brickX, brickY, brickWidth, brickHeight)
        ctx.fillStyle = "#0095DD"
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.closePath()
      }
    }
  }
}

// glavna funkcija za crtanje cijele igre
function draw() {
  if (gameOver) return

  ctx.clearRect(0, 0, canvas.width, canvas.height) // očisti canvas za svaki frame
  drawBricks()
  drawBall()
  drawPaddle()
  drawScore()
  collisionDetection()

  if (ball.y + ball.speedY > canvas.height - ball.radius) {
    gameOver = true
    drawGameOver("GAME OVER")
    return
  }

  ball.x += ball.speedX
  ball.y += ball.speedY

  // provjera sudara loptice s rubovima ekrana
  if (ball.x + ball.speedX > canvas.width - ball.radius || ball.x + ball.speedX < ball.radius) {
    ball.speedX = -ball.speedX
  }
  if (ball.y + ball.speedY < ball.radius) {
    ball.speedY = -ball.speedY
  } else if (ball.y + ball.speedY > canvas.height - ball.radius) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      ball.speedY = -ball.speedY
    }
  }

  // pomicanje palice ako su tipke strelice pritisnute
  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += 7
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= 7
  }

  requestAnimationFrame(draw)
}

// funkcija za detekciju sudara loptice s ciglama
function collisionDetection() {
  let allBricksCleared = true
  for (let c = 0; c < gameConfig.brickColumnCount; c++) {
    for (let r = 0; r < gameConfig.brickRowCount; r++) {
      const brick = bricks[c][r]
      if (brick.status === 1) {
        allBricksCleared = false
        if (
          ball.x > brick.x &&
          ball.x < brick.x + (canvas.width / gameConfig.brickColumnCount) &&
          ball.y > brick.y &&
          ball.y < brick.y + 20
        ) {
          ball.speedY = -ball.speedY
          brick.status = 0
          score++
          if (score > highScore) {
            highScore = score
            localStorage.setItem('highScore', highScore)
          }
        }
      }
    }
  }

  if (allBricksCleared) {
    gameOver = true
    drawGameOver("YOU WON!")
  }
}

// funkcija koja crta lopticu
function drawBall() {
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
  ctx.fillStyle = ball.color
  ctx.fill()
  ctx.closePath()
}

// funkcija koja crta palicu
function drawPaddle() {
  ctx.beginPath()
  ctx.rect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height)
  ctx.fillStyle = paddle.color
  ctx.fill()
  ctx.closePath()
}

// prikaz trenutnog rezultata i visokog rezultata
function drawScore() {
  ctx.font = "16px Arial"
  ctx.fillStyle = "#FFF"
  ctx.textAlign = "right"
  ctx.fillText("Score: " + score + " | High Score: " + highScore, canvas.width - 10, 20)
}
