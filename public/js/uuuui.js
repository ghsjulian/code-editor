import folderStructure from "./files-tree.js";
import { socket, currentClientId } from "./client.js";
const createFolderBtn = document.querySelector(".create-folder");
const createFileBtn = document.querySelector(".create-file");
var path = "";
var currentFolderId = "";

/*=============================*/

const closeInput = () => {
    document.querySelectorAll("#tree-root input").forEach(el => {
        el.style.marginTop = "0";
        el.style.marginBottom = "0";
        el.style.display = "none";
        el.previousElementSibling.style.marginBottom = "40px";
    });
};

const createFile = () => {
    closeInput();
    if (!currentFolderId) return;
    let input = document.getElementById(currentFolderId);
    let root = document.querySelector(`.${currentFolderId} .children`);

    input.style.marginTop = "0";
    input.style.marginBottom = "35px";
    input.style.display = "block";
    input.placeholder = "Enter File Name...";
    input.previousElementSibling.style.marginBottom = "10px";
    input.focus();

    input.onkeyup = e => {
        if (e.keyCode === 13) {
            if (input.value.trim() !== "") {
                const folderName = input.value.trim();
                const folderPath = path + "/" + folderName;

                // Check for existing folder names
                var matched = [];
                const matches = Array.from(
                    root.querySelectorAll(".file #name")
                ).some(el => {
                    matched.push(el.textContent.trim());
                });
                let isExist = matched.includes(folderName);
                if (!isExist) {
                    let folder = {
                        name: folderName,
                        type: "file",
                        path: folderPath,
                        children: [] // Initialize with an empty array for children
                    };
                    // Call your function to generate the tree or append the folder
                    generateTree([folder], root);
                    input.value = "";
                } else {
                    console.log("File already exists:", folderName);
                }
                closeInput();
            }
        }
    };
};
const createFolder = () => {
    if (!currentFolderId) return;
    closeInput();
    let input = document.getElementById(currentFolderId);
    let root = document.querySelector(`.${currentFolderId} .children`);

    input.style.marginTop = "0";
    input.style.marginBottom = "35px";
    input.style.display = "block";
    input.placeholder = "Enter Folder Name...";
    input.previousElementSibling.style.marginBottom = "10px";
    input.focus();

    input.onkeyup = e => {
        if (e.keyCode === 13) {
            if (input.value.trim() !== "") {
                const folderName = input.value.trim();
                const folderPath = path + "/" + folderName;

                // Check for existing folder names
                var matched = [];
                const matches = Array.from(
                    root.querySelectorAll(".folder #name")
                ).some(el => {
                    matched.push(el.textContent.trim());
                });
                let isExist = matched.includes(folderName + "/");
                if (!isExist) {
                    let folder = {
                        name: folderName,
                        type: "folder",
                        path: folderPath,
                        children: [{}] // Initialize with an empty array for children
                    };
                    // Call your function to generate the tree or append the folder
                    generateTree([folder], root);
                    input.value = "";
                } else {
                    console.log("Folder already exists:", folderName);
                }
                closeInput();
            }
        }
    };
};

createFileBtn.onclick = createFolder;
createFolderBtn.onclick = createFile;
function generateTree(data, parentElement) {
    data.forEach((item, idx) => {
        const li = document.createElement("li");
        if (!item?.name) return;
        li.className = `tree-node ${item.type} ${item.name}-${idx}`;
        li.setAttribute("data-path", `${item.name}-${idx}`);

        const isFolder = item.type === "folder";
        const hasChildren =
            isFolder && item.children && item.children.length > 0;

        if (item?.name) {
            li.innerHTML = `
                    <div>
                        <i class="fas fa-${isFolder ? "folder" : "file"}"></i>
                        <span id="name">${item.name}${
                            isFolder ? "/" : ""
                        }</span>
                        </div>
                           <input style="display:none" id="${
                               item.name
                           }-${idx}" placeholder="Enter File Name" type="text" />
                `;
        }

        if (hasChildren) {
            const ul = document.createElement("ul");
            ul.className = "children";
            li.appendChild(ul);
            generateTree(item.children, ul);

            const toggle = li.querySelector(".folder-toggle");
            const icon = li.querySelector("i");

            li.addEventListener("click", e => {
                if (
                    e.target === li ||
                    e.target === li.querySelector("div") ||
                    e.target === icon ||
                    e.target === li.querySelector("span:last-child") ||
                    e.target === toggle
                ) {
                    li.classList.toggle("open");
                    //closeInput();

                    if (li.classList.contains("open")) {
                        icon.classList.remove("fa-folder");
                        icon.classList.add("fa-folder-open");
                        li.querySelector(".folder-toggle").textContent = "[-]";
                        path = item.path;
                        currentFolderId = `${item.name}-${idx}`;
                    } else {
                        icon.classList.remove("fa-folder-open");
                        icon.classList.add("fa-folder");
                        li.querySelector(".folder-toggle").textContent = "[+]";
                        path = item.path;
                        currentFolderId = `${item.name}-${idx}`;
                    }
                }
            });
        } else {
            li.addEventListener("click", () => {
                console.log(`Selected file: ${item.name}`);
            });
        }

        parentElement.appendChild(li);
    });
}

const menuBtn = document.querySelector("#menu-btn");
menuBtn.onclick = () => {
    if (currentFolderId) {
        closeInput();
    }
    document.querySelector(".sidebar").classList.toggle("mobile-menu");
};

document.addEventListener("DOMContentLoaded", () => {
    const treeRoot = document.getElementById("tree-root");
    socket.on("folder-structure", async data => {
        if (await data) {
            const folders = JSON.parse(data);
            generateTree([folders], treeRoot);
        }
    });
    generateTree(folderStructure, treeRoot);
});
