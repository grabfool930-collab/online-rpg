const socket = io();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

const players = {};
let myId = null;

const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

socket.on("connect", () => {
    myId = socket.id;
});

socket.on("currentPlayers", (data) => {
    Object.assign(players, data);
});

socket.on("newPlayer", (player) => {
    players[player.id] = player;
});

socket.on("playerMoved", (player) => {
    players[player.id] = player;
});

socket.on("playerLeft", (id) => {
    delete players[id];
});

function update() {

    if (!players[myId]) return;

    let p = players[myId];
    let speed = 4;

    if (keys["w"]) p.y -= speed;
    if (keys["s"]) p.y += speed;
    if (keys["a"]) p.x -= speed;
    if (keys["d"]) p.x += speed;

    // World boundaries
    p.x = Math.max(20, Math.min(WORLD_WIDTH - 20, p.x));
    p.y = Math.max(20, Math.min(WORLD_HEIGHT - 20, p.y));

    socket.emit("move", p);
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!players[myId]) return;

    let me = players[myId];

    // Camera
    let camX = me.x - canvas.width / 2;
    let camY = me.y - canvas.height / 2;

    // Grass background
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(-camX, -camY, WORLD_WIDTH, WORLD_HEIGHT);

    // Grid
    ctx.strokeStyle = "#88cc88";

    for (let x = 0; x < WORLD_WIDTH; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x - camX, -camY);
        ctx.lineTo(x - camX, WORLD_HEIGHT - camY);
        ctx.stroke();
    }

    for (let y = 0; y < WORLD_HEIGHT; y += 100) {
        ctx.beginPath();
        ctx.moveTo(-camX, y - camY);
        ctx.lineTo(WORLD_WIDTH - camX, y - camY);
        ctx.stroke();
    }

    // Draw players
    for (let id in players) {

        let p = players[id];

        ctx.fillStyle = id === myId ? "blue" : "red";

        ctx.beginPath();
        ctx.arc(
            p.x - camX,
            p.y - camY,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "black";
        ctx.fillText(
            id === myId ? "You" : "Friend",
            p.x - camX - 15,
            p.y - camY - 30
        );
    }
}

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();