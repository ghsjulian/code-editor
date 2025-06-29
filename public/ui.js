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
    var selectedFolder = [];
    var tree;
    var selectedItem;
    var isEditing = false;

    /*=============================*/

    const isExist = (currentFolder, name, type, callback) => {
        let found = false;

        function traverse(node) {
            // Check if we've already found a match
            if (found) return;

            // Check if current node matches
            if (
                node.name &&
                node.name.toLowerCase() === name.toLowerCase() &&
                node.type === type
            ) {
                found = true;
                return;
            }

            // Traverse children if it's a folder
            if (node.type === "folder" && node.children) {
                for (const child of node.children) {
                    traverse(child);
                    if (found) return;
                }
            }
        }

        // Start traversal
        for (const node of currentFolder) {
            traverse(node);
            if (found) break;
        }

        // Call callback once at the end
        callback(found);
    };

    const searchInTree = (folders, searchTerm, key, value) => {
        function traverse(node) {
            if (
                node[key] &&
                node[key].toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                node.name = value;
            }
            if (node.type === "folder" && node.children) {
                for (const child of node.children) {
                    traverse(child);
                    // if (child.name.toLowerCase() === searchTerm.toLowerCase()) {
                    //                         child.name = value;
                    //                     }
                    //console.log(child);
                }
            }
        }
        for (const node of folders) {
            traverse(node);
        }
        return folders;
    };
    menuItems.forEach(item => {
        item.onclick = () => {
            let action = item.getAttribute("data-action");
            switch (action) {
                case "new-folder":
                    selectedItem.element.click();
                    selectedItem.element.click();
                    createFolder();
                    break;
                case "new-file":
                    selectedItem.element.click();
                    selectedItem.element.click();
                    createFile();
                    break;

                case "save-all":
                    // code
                    break;

                case "rename":
                    renameItem();
                    break;

                case "delete":
                    // code
                    break;

                case "copy":
                    // code
                    break;

                case "paste":
                    // code
                    break;

                case "cut":
                    // code
                    break;
            }
        };
    });

    const closeInput = () => {
        if (isEditing) return;
        document.querySelectorAll("#tree-root input").forEach(el => {
            el.style.marginTop = "0";
            el.style.marginBottom = "0";
            el.style.display = "none";
            el.previousElementSibling.style.marginBottom = "40px";
            el.value = "";
        });
    };

    const renameItem = () => {
        isEditing = true;
        let input = document.createElement("input");

        input.style.padding = ".3rem 1rem";
        input.style.outline = "none";
        input.style.width = "90%";
        input.style.borderRadius = "5px";
        input.style.border = "1.5px solid #0083c2";
        input.placeholder = `Edit ${selectedItem.type} name`;
        input.value = selectedItem.name;
        input.setAttribute("enterkeyhint", "go");
        selectedItem.span.innerHTML = "";
        selectedItem.span.appendChild(input);
        input.focus();

        input.addEventListener("keyup", e => {
            // Some Android keyboards might trigger keyup instead of keydown/keypress
            if (e.key === "Enter" || e.keyCode === 13) {
                // selectedItem.span.innerHTML = "";
                // selectedItem.span.textContent = input?.value;

                const newTree = searchInTree(
                    tree,
                    selectedItem.name,
                    "name",
                    input.value.trim()
                );
                let root = document.getElementById("tree-root");
                //root.innerHTML = "";
                //generateTree(newTree, root);
                selectedItem.span.textContent = input.value.trim();
            }
        });
        input.addEventListener("blur", () => {
            selectedItem.span.innerHTML = "";
            selectedItem.span.textContent = selectedItem.name;
        });
    };

    const createFile = () => {
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

                isExist([currentFolder], filename, "file", exist => {
                    console.log(exist);
                });
                return;
                if (currentFolder?.children) {
                    let isExist = currentFolder?.children?.filter(
                        el => el.name === filename
                    );
                    if (isExist.length === 0) {
                        let item = {
                            name: filename,
                            type: "file",
                            path: currentFolder.path
                        };
                        generateTree([item], root);
                        input.value = "";
                        currentFolder.children.push(item);
                        closeInput();
                    } else {
                        errorElm.style.display = "flex";
                        document.querySelector(".error-msg").textContent =
                            "File already exists - " + filename;
                        console.log("File already exists:", filename);
                        closeInput();
                    }
                }
            }
        });
        input.addEventListener("blur", () => {
            closeInput();
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
        input.placeholder = "Enter Folder Name...";
        input.previousElementSibling.style.marginBottom = "10px";
        input.focus();
        const old = input.nextElementSibling.querySelectorAll("li div");

        input.addEventListener("keyup", e => {
            // Some Android keyboards might trigger keyup instead of keydown/keypress
            if (e.key === "Enter" || e.keyCode === 13) {
                e.preventDefault();
                let foldername = input.value.trim();
                isExist([currentFolder], foldername, "folder", exist => {
                    if (!exist) {
                        let item = {
                            name: foldername,
                            type: "folder",
                            path: `${currentFolder.path}/${foldername}/`,
                            children: [{}] // Initialize with an empty array for children
                        };
                        generateTree([item], root);
                        input.value = "";
                        currentFolder.children.push(item);
                        closeInput();
                    } else {
                        errorElm.style.display = "flex";
                        document.querySelector(".error-msg").textContent =
                            "Folder already exists - " + foldername;
                        console.log("Folder already exists:", foldername);
                        closeInput();
                    }
                });
            }
        });
        input.addEventListener("blur", () => {
            closeInput();
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
                    <div data-type="${item.type}" data-name="${
                        item.name
                    }" data-path="${item.path}">
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
                        selectedFolder = [item];

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
                            selectedFolder = [item];
                        }
                    }
                });
            } else {
                li.addEventListener("click", () => {
                    console.log(`Selected file: ${item.name}`);
                    // console.log(item.path);
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
                selectedItem = {
                    name: e.target.getAttribute("data-name"),
                    type: e.target.getAttribute("data-type"),
                    path: e.target.getAttribute("data-path"),
                    span: e.target.querySelector("span"),
                    element: li
                };
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
            tree = [folders];
        }
    });
    // generateTree(folderStructure, treeRoot);
    const terminalBtn = document.getElementById("terminal-btn");
    const terminalWindow = document.querySelector(".terminal-window");
    const closeTerminal = document.querySelector("#close-cmd");
    terminalBtn.onclick = () => {
        alert();
        terminalWindow.style.display = "flex";
    };
    closeTerminal.onclick = () => {
        terminalWindow.style.display = "none";
    };
});
