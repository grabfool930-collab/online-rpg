const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

const players = {};

io.on("connection", (socket) => {
    console.log("Player joined:", socket.id);

    players[socket.id] = {
        x: 100,
        y: 100
    };

    socket.emit("currentPlayers", players);

    socket.broadcast.emit("newPlayer", {
        id: socket.id,
        x: 100,
        y: 100
    });

    socket.on("move", (data) => {
        players[socket.id] = data;
        io.emit("playerMoved", {
            id: socket.id,
            ...data
        });
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("playerLeft", socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});