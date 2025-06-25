import folderStructure from "./files-tree.js";
import { socket, currentClientId } from "./client.js";

document.addEventListener("DOMContentLoaded", () => {
    const createFolderBtn = document.querySelector(".create-folder");
    const createFileBtn = document.querySelector(".create-file");
    const errorElm = document.querySelector(".popup-alert");
    const menuItems = document.querySelectorAll(".context-menu .menu-item");
    var path = "";
    var currentFolderId = "";
    var currentFolder = [];

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
        const old = input.nextElementSibling.querySelectorAll("li div");

        input.addEventListener("keyup", e => {
            // Some Android keyboards might trigger keyup instead of keydown/keypress
            if (e.key === "Enter" || e.keyCode === 13) {
                e.preventDefault();
                let filename = input.value.trim();
                if (currentFolder?.children) {
                    let isExist = currentFolder?.children?.filter(
                        el => el.name === filename
                    );
                    if (isExist.length === 0) {
                        let item = {
                            name: filename,
                            type: "file",
                            path: currentFolder.path
                            // Initialize with an empty array for children
                        };
                        generateTree([item], root);
                        input.value = "";
                        currentFolder.children.push(item);
                    } else {
                        errorElm.style.display = "flex";
                        document.querySelector(".error-msg").textContent =
                            "File already exists - " + filename;
                        console.log("File already exists:", filename);
                        return;
                    }
                    closeInput();
                }
            }
        });
    };
    const createFolder = () => {
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
        const old = input.nextElementSibling.querySelectorAll("li div");

        input.addEventListener("keyup", e => {
            // Some Android keyboards might trigger keyup instead of keydown/keypress
            if (e.key === "Enter" || e.keyCode === 13) {
                e.preventDefault();
                let foldername = input.value.trim();
                console.log(currentFolder);
                if (currentFolder?.children) {
                    let isExist = currentFolder?.children?.filter(
                        el => el.name === foldername && el.type === "folder"
                    );
                    if (isExist.length === 0) {
                        let item = {
                            name: foldername,
                            type: "folder",
                            path: `${currentFolder.path}/${foldername}/`,
                            children: [{}] // Initialize with an empty array for children
                        };
                        generateTree([item], root);
                        input.value = "";
                        currentFolder.children.push(item);
                    } else {
                        errorElm.style.display = "flex";
                        document.querySelector(".error-msg").textContent =
                            "Folder already exists - " + foldername;
                        console.log("Folder already exists:", foldername);
                        return;
                    }
                    closeInput();
                }
            }
        });
    };

    createFileBtn.onclick = createFile;
    createFolderBtn.onclick = createFolder;
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
                        <span path="${item.path}" id="name ${item.name}">${
                            item.name
                        }${isFolder ? "/" : ""}</span>
                        </div>
                           <input id="${
                               item.name
                           }-${idx}" enterkeyhint="go" placeholder="Enter File Name" type="text" />
                `;
            }

            if (hasChildren) {
                const ul = document.createElement("ul");
                ul.className = "children";
                li.appendChild(ul);
                generateTree(item.children, ul);
                const icon = li.querySelector("i");

                li.addEventListener("click", e => {
                    if (
                        e.target === li ||
                        e.target === li.querySelector("div") ||
                        e.target === icon ||
                        e.target === li.querySelector("span:last-child")
                    ) {
                        li.classList.toggle("open");
                        closeInput();
                        currentFolder = item;

                        if (li.classList.contains("open")) {
                            icon.classList.remove("fa-folder");
                            icon.classList.add("fa-folder-open");
                            path = item.path;
                            currentFolderId = `${item.name}-${idx}`;
                        } else {
                            icon.classList.remove("fa-folder-open");
                            icon.classList.add("fa-folder");
                            path = item.path;
                            currentFolderId = `${item.name}-${idx}`;
                            currentFolder = item;
                        }
                    }
                });
            } else {
                li.addEventListener("click", () => {
                    console.log(`Selected file: ${item.name}`);
                    console.log(item.path);
                });
            }
            // Opening Menu
            const contextMenu = document.getElementById("contextMenu");
            let selectedLi = null;
            li.addEventListener("contextmenu", e => {
                e.preventDefault(); // Prevent default browser context menu
                selectedLi = li;

                // Position the context menu
                const x = e.clientX;
                const y = e.clientY;

                contextMenu.style.left = `${x}px`;
                contextMenu.style.top = `${y}px`;
                contextMenu.classList.add("active");

                // Log the clicked item after 2.5 seconds
                setTimeout(() => {
                    console.log("Item data:", {
                        id: li.dataset.id,
                        text: li.textContent.trim(),
                        element: li
                    });
                }, 2500);
            });

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
    document.addEventListener("click", () => {
        contextMenu.classList.remove("active");
    });

    document.querySelector(".close").onclick = () => {
        errorElm.style.display = "none";
        document.querySelector(".error-msg").textContent = "";
    };

    const treeRoot = document.getElementById("tree-root");
    socket.on("folder-structure", async data => {
        if (await data) {
            const folders = JSON.parse(data);
            generateTree([folders], treeRoot);
        }
    });
    generateTree(folderStructure, treeRoot);
});
