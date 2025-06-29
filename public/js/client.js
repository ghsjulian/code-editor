export var socket;
export var currentClientId;
export var currentName = "Anonymous";
export const clientsMap = new Map();
const preLoader = document.querySelector(".pre-loader");

const projectName = localStorage.getItem("project-name") || null;
socket = io("http://localhost:9000");
socket.on("connect", () => {
    currentClientId = socket.id;
    console.log(`\n[+] Client Connected --> ${socket.id}\n`);
    if (projectName !== null) {
        socket.emit("handshake", projectName);
    } else {
        preLoader.style.display = "none";
    }

    socket.on("error", error => {
        console.log(`\n[!] Socket Error --> ${error}\n`);
    });

    socket.on("disconnect", () => {
        console.log(`\n[-] Client Disconnected --> ${socket.id}\n`);
    });
});
