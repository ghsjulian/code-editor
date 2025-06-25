const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const readDir = require("../functions/read.dir");

const app = express();
const server = http.createServer(app);
const corsOption = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400
};
app.use(cors(corsOption));
app.use(express.json({ limit: "800mb" }));
app.use(express.urlencoded({ extended: true }));

const root = path.join(__dirname, "../../");
const clients = new Map();
const IO = new Server(server, { cors: corsOption });

IO.on("connection", async socket => {
    clients.set(socket.id, { socket, user: Math.floor(Math.random() * 1000) });
    console.log(`\n[+] Client Connected --> ${socket.id}\n`);

    try {
        const folders = await readDir(root + "code/public/styles", "code");
        IO.to(socket.id).emit("folder-structure", JSON.stringify(folders));
    } catch (error) {
        console.log(`\n[!] Something Error --> ${error.message}\n`);
    }

    socket.on("disconnect", () => {
        console.log(`\n[-] Client Disconnected --> ${socket.id}\n`);
        clients.delete(socket.id);
    });
});

module.exports = { app, server, IO, clients };
