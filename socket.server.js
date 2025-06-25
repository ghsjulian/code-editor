const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const readDir = require("./functions/read.dir")
const path = require("path")
const root = path.join(__dirname,"../")


// Initialize the app and server
const app = express();
app.use(cors());
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this for production
        methods: ["GET", "POST"]
    }
});

// Store connected clients
const clients = new Map();

// Server routes
app.get("/", (req, res) => {
    res.send("Socket.IO Server is running");
});

// Socket.IO connection handling
io.on("connection", async(socket) => {
    console.log(`Client connected: ${socket.id}`);
    clients.set(socket.id, {
        socket,
        name: `User-${Math.floor(Math.random() * 1000)}`
    });
    
    const data = await readDir(root+"code","code")
    socket.emit("get-data", data);

    // Send the client their ID and list of all connected clients
    socket.emit("connected", {
        id: socket.id,
        name: clients.get(socket.id).name,
        clients: Array.from(clients.entries()).map(([id, data]) => ({
            id,
            name: data.name
        }))
    });

    // Notify other clients about the new connection
    socket.broadcast.emit("client-connected", {
        id: socket.id,
        name: clients.get(socket.id).name
    });

    // Handle incoming private messages
    socket.on("private-message", ({ to, message }) => {
        const recipient = clients.get(to);
        if (recipient) {
            recipient.socket.emit("private-message", {
                from: socket.id,
                fromName: clients.get(socket.id).name,
                message,
                timestamp: new Date().toISOString()
            });
            // Send delivery confirmation to the sender
            socket.emit("message-delivered", { to, messageId: Date.now() });
        } else {
            socket.emit("error", `Recipient ${to} not found`);
        }
    });

    // Handle client name change
    socket.on("set-name", name => {
        if (name && typeof name === "string") {
            clients.get(socket.id).name = name;
            socket.broadcast.emit("client-updated", {
                id: socket.id,
                name: name
            });
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        clients.delete(socket.id);
        io.emit("client-disconnected", { id: socket.id });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
