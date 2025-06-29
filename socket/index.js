const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const readDir = require("../functions/read.dir");
const executeCommand = require("../functions/executor");

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
    // Creating Handske...
    socket.on("handshake", async projectName => {
        try {
            const folders = await readDir(root + projectName, projectName);
            IO.to(socket.id).emit("folder-structure", JSON.stringify(folders));
        } catch (error) {
            console.log(`\n[!] Something Error --> ${error.message}\n`);
        }
    });

    socket.on("create-new-project", async projectName => {
        try {
            if (projectName) {
                await executeCommand(projectName);
                IO.to(socket.id).emit("new-project-created", {
                    status: true,
                    message: "New Project Created Successfully"
                });
            } else {
                return;
            }
        } catch (error) {
            console.log(
                `\n[!] Error Creating New Project - ${error.message}\n`
            );
        }
    });
    socket.on("create-new-folder", async data => {
        try {
            if (data) {
                let mpath = path.join(__dirname, "../../", data?.path);
                await executeCommand(`mkdir ${mpath}`);
            } else {
                return;
            }
        } catch (error) {
            console.log(`\n[!] Error Creating New Folder - ${error}\n`);
        }
    });
    socket.on("create-new-file", async data => {
        try {
            if (data) {
                let mpath = path.join(__dirname, "../../", data?.path);
                await executeCommand(`touch ${mpath}`);
            } else {
                return;
            }
        } catch (error) {
            console.log(`\n[!] Error Renaming File - ${error}\n`);
        }
    });
    socket.on("rename", async data => {
        try {
            if (data) {
                let oldpath = path.join(__dirname, "../../", data?.oldpathName);
                let newpath = path.join(__dirname, "../../", data?.newpathName);
                await executeCommand(`mv ${oldpath} ${newpath}`);
            } else {
                return;
            }
        } catch (error) {
            console.log(`\n[!] Error Creating New File - ${error}\n`);
        }
    });
    socket.on("delete", async data => {
        try {
            if (data) {
                let fpath = path.join(__dirname, "../../", data.path);
                if (data.type === "folder") {
                    await executeCommand(`rm -rf ${fpath}`);
                } else {
                    await executeCommand(`rm ${fpath}`);
                }
            } else {
                return;
            }
        } catch (error) {
            console.log(`\n[!] Error Deleting File/Folder - ${error}\n`);
        }
    });
    socket.on("executor", async cmd => {
        try {
            if (cmd) {
                let fpath = path.join(__dirname, "../../");
                const result = await executeCommand(`cd ${fpath} && ${cmd}`);
               console.log(result)
                IO.to(socket.id).emit("executor-result", result);
            } else {
                return;
            }
        } catch (error) {
            console.log(`\n[!] Error Executing Commands - ${error}\n`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`\n[-] Client Disconnected --> ${socket.id}\n`);
        clients.delete(socket.id);
    });
});

module.exports = { app, server, IO, clients };
