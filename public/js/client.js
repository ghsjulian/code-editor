export var socket;
export var currentClientId;
export var currentName = "Anonymous";
export const clientsMap = new Map();

socket = io("http://localhost:9000");
socket.on("connect", () => {
    currentClientId = socket.id;
    console.log(`\n[+] Client Connected --> ${socket.id}\n`);

    socket.on("error", error => {
        console.log(`\n[!] Socket Error --> ${error}\n`);
    });

    socket.on("disconnect", () => {
        console.log(`\n[-] Client Disconnected --> ${socket.id}\n`);
    });
});
