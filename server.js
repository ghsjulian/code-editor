const express = require("express")
const path = require("path");
const { app, server, IO, clients } = require("./socket");
const PORT = 9000;
const HOST = "http://localhost";

const publicPath = path.join(__dirname, "public");
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(publicPath + "/index.html");
});

server.listen(PORT, () => {
    console.log(`\n[+] Server Listening --> ${HOST}:${PORT}\n`);
});
