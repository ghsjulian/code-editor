import { socket, currentClientId } from "./client.js";
const terminalBtn = document.getElementById("terminal-btn");
const terminalWindow = document.querySelector(".terminal-window");
const terminalInput = document.querySelector("#terminal-input");
const newProjectArea = document.querySelector(".new-project");
const newProjectbutton = document.querySelector(".new-project button");
const newProjectinput = document.querySelector(".new-project input");
var TERMINAL_PATH = "~(home/";
var PATH = "";

terminalBtn.onclick = () => {
    terminalWindow.classList.toggle("term-active");
    terminalInput.focus();
};

terminalWindow.onclick = () => {
    terminalInput.focus();
};
terminalInput.onkeyup = e => {
    if (e.key === "Enter" || e.keyCode === 13) {
        let cmd = terminalInput.value.trim();
        let cmdParts = cmd.split(" ");
        if (cmd.toLowerCase() === "cls") {
            document.querySelectorAll(".output").forEach(el => {
                el.remove();
            });
        }
        if (cmdParts.length === 2) {
            if (cmdParts[0] === "cd") {
                TERMINAL_PATH += cmdParts[1] + "/)";
                PATH += cmdParts[1] + "/";
                document.querySelector("#terminal .path").textContent =
                    TERMINAL_PATH;
                executor(cmd);
                return;
            }
        }
        if (cmd === "ls") {
            executor(`cd ${PATH} && ls -a`);
            return;
        }
        // TODO : Socket will be call here...
    }
};

const executor = cmd => {
    socket.emit("executor", cmd);
    socket.on("executor-result", result => {
        const output = document.createElement("div");
        output.className = "output";
        output.textContent = `root@kali:~#
            ${result}`;
        console.log(result);
        const terminal = document.getElementById("terminal");
        terminal.insertBefore(output, document.querySelector(".prompt-line"));
        document.querySelector("#terminal-input").value = "";
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    });
};
/* Creating New Project */
let project = localStorage.getItem("project-name") || null;
if (project === null) {
    newProjectArea.style.display = "flex";
}
newProjectbutton.onclick = () => {
    newProjectinput.style.display = "block";
    newProjectbutton.style.display = "none";
    newProjectinput.focus();
};
newProjectinput.onkeyup = e => {
    if (e.key === "Enter" || e.keyCode === 13) {
        let projectName = newProjectinput.value.trim();
        if (projectName) {
            socket.emit("create-new-project", `cd && mkdir ${projectName}`);
            newProjectArea.style.display = "none";
            localStorage.setItem("project-name", projectName);
        } else {
            return;
        }
    }
};
newProjectinput.onblur = e => {
    newProjectinput.value = "";
    newProjectinput.style.display = "none";
    newProjectbutton.style.display = "block";
};

socket.on("new-project-created", data => {
    let createdProject = localStorage.getItem("project-name") || null;
    if (createdProject !== null) {
        socket.emit("handshake", createdProject);
    }
});
