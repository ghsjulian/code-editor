import { socket, currentClientId } from "./client.js";
import editor from "./editor.js";

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
    var openedFiles = new Set();

    /*=============================*/
    // Tab bar functionalities...
    const tabbar = document.querySelector(".tab-bar");
    const closeFile = tabbar.querySelectorAll("i");

    closeFile.forEach(close => {
        close.onclick = () => {
            close.parentElement.remove();
        };
    });

    // Tab bar functionalities

    // Function to create a file tab
    const createFileTab = (fileName, fileType, path) => {
        if (openedFiles.has(fileName)) return;
        openedFiles.add(fileName);

        const tab = document.createElement("p");
        tab.dataset.file = fileName;
        tab.dataset.path = path;

        // Set icon based on file type
        let iconClass = "";
        let iconColor = "";
        switch (fileType) {
            case "html":
                iconClass = "fab fa-html5";
                iconColor = "text-red-400";
                break;
            case "css":
                iconClass = "fab fa-css3-alt";
                iconColor = "text-blue-400";
                break;
            case "javascript":
                iconClass = "fab fa-js";
                iconColor = "text-yellow-300";
                break;
            case "json":
                iconClass = "fas fa-cog";
                iconColor = "text-gray-400";
                break;
            case "image":
                iconClass = "fas fa-image";
                iconColor = "text-purple-400";
                break;
            default:
                iconClass = "fas fa-file";
                iconColor = "text-gray-400";
        }

        tab.innerHTML = `
                <span>
                   <i class="fas fa-file"></i>
                   ${fileName}
                </span>
                <i id="close" class="fa fa-x"></i>
            `;
        tabbar.appendChild(tab);
        setActiveTab(tab);
        // Add close functionality
        tab.querySelector("#close").addEventListener("click", e => {
            e.stopPropagation();
            closeFileTab(tab);
        });
        // Add click functionality
        tab.addEventListener("click", () => {
            setActiveTab(tab);
            loadFileContent(fileName, fileType, path);
        });
        loadFileContent(fileName, fileType, path);
        return tab;
    };

    const setActiveTab = tab => {
        document
            .querySelectorAll(".tab-bar p")
            .forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
    };
    // Function to close file tab
    const closeFileTab = tab => {
        const lastElement = tab.previousElementSibling;
        openedFiles.delete(tab.dataset.file);
        tab.remove();
        editor.setValue("");
        // If no tabs left, clear editor
        if (openedFiles.size === 0) {
            editor.setValue("");
        } else {
            let openFiles = [...openedFiles];
            let lastFile = openFiles[openFiles.length - 1].split(".");
            let ftype = lastFile[lastFile.length - 1];
            let fname = openFiles[openFiles.length - 1];
            loadFileContent(fname, ftype,lastElement.getAttribute("path"));
            setActiveTab(lastElement);
        }
    };
    // Function to load file content (mock implementation)
    function loadFileContent(fileName, fileType, path) {
        var content = "";
        let mode = "";

        // TODO: socket implements here...
        let project = localStorage.getItem("project-name");
        let trimfpath = path.split("/");
        let newPath;
        for (let i = 0; i < trimfpath.length; i++) {
            if (trimfpath[i] === project) {
                newPath = trimfpath.slice(i, trimfpath.length).toString();
            }
        }
        let strpath = newPath.replaceAll(",", "/");
        socket.emit("get-file-content", strpath);
        socket.on("read-file-content", data => {
            console.log(data);
            editor.session.setMode(mode);
            editor.setValue(data);
            editor.clearSelection();
            editor.resize();
        });

        switch (fileType) {
            case "html":
                mode = "ace/mode/html";
                break;
            case "css":
                mode = "ace/mode/css";
                break;
            case "js":
                mode = "ace/mode/javascript";
                break;
            case "json":
                mode = "ace/mode/json";
                break;
            case "jpg":
                content = `// Binary image data cannot be displayed in text editor`;
                mode = "ace/mode/text";
                break;
            default:
                content = `// Unknown file type`;
                mode = "ace/mode/text";
        }
    }

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
                let trimPath = node.path.split("/");
                trimPath[trimPath.length - 1] = value;
                let newPath = trimPath.toString().replaceAll(",", "/");
                node.name = value;
                node.path = newPath + "/";
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
                    deleteItem();
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

    const showError = msg => {
        errorElm.style.display = "flex";
        document.querySelector(".error-msg").textContent = msg;
    };

    /* ... [REST OF YOUR ORIGINAL CODE REMAINS THE SAME] ... */

    /*======== FIXED FUNCTIONS ========*/
    const createFile = () => {
        if (!currentFolderId) return;
        let input = document.getElementById(currentFolderId);
        let root =
            document.querySelector(`.${currentFolderId} .children`) ||
            document.createElement("ul"); // Fallback

        input.style.marginTop = "0";
        input.style.marginBottom = "35px";
        input.style.display = "block";
        input.setAttribute("enterkeyhint", "go");
        input.placeholder = "Enter File Name...";
        input.previousElementSibling.style.marginBottom = "10px";
        input.focus();

        input.onkeyup = e => {
            if (e.key === "Enter" || e.keyCode === 13) {
                const filename = input.value.trim();
                if (!filename) return;

                isExist([currentFolder], filename, "file", exists => {
                    if (!exists) {
                        const newFile = {
                            name: filename,
                            type: "file",
                            path: currentFolder.path + filename
                        };

                        if (!currentFolder.children)
                            currentFolder.children = [];
                        currentFolder.children.push(newFile);

                        generateTree([newFile], root);
                        // TODO: socket implements here...
                        let project = localStorage.getItem("project-name");
                        let fpath = currentFolder.path + filename;
                        let trimfpath = fpath.split("/");
                        let newPath;
                        for (let i = 0; i < trimfpath.length; i++) {
                            if (trimfpath[i] === project) {
                                newPath = trimfpath
                                    .slice(i, trimfpath.length)
                                    .toString();
                            }
                        }
                        let strpath = newPath.replaceAll(",", "/");
                        socket.emit("create-new-file", {
                            path: strpath,
                            filename
                        });
                        input.value = "";
                        closeInput();
                    } else {
                        showError(`File "${filename}" already exists!`);
                    }
                });
            }
        };
        input.onblur = closeInput;
    };
    const createFolder = () => {
        if (!currentFolderId) return;
        let input = document.getElementById(currentFolderId);
        let root =
            document.querySelector(`.${currentFolderId} .children`) ||
            document.createElement("ul"); // Fallback

        input.style.marginTop = "0";
        input.style.marginBottom = "35px";
        input.style.display = "block";
        input.setAttribute("enterkeyhint", "go");
        input.placeholder = "Enter Folder Name...";
        input.previousElementSibling.style.marginBottom = "10px";
        input.focus();

        input.onkeyup = e => {
            if (e.key === "Enter" || e.keyCode === 13) {
                const foldername = input.value.trim();
                if (!foldername) return;

                isExist([currentFolder], foldername, "folder", exists => {
                    if (!exists) {
                        const newFolder = {
                            name: foldername,
                            type: "folder",
                            path: currentFolder.path + foldername + "/",
                            children: [{}]
                        };

                        if (!currentFolder.children)
                            currentFolder.children = [];
                        currentFolder.children.push(newFolder);

                        generateTree([newFolder], root);
                        // TODO: socket implements here...
                        let project = localStorage.getItem("project-name");
                        let fpath = currentFolder.path + foldername + "/";
                        let trimfpath = fpath.split("/");
                        let newPath;
                        for (let i = 0; i < trimfpath.length; i++) {
                            if (trimfpath[i] === project) {
                                newPath = trimfpath
                                    .slice(i, trimfpath.length - 1)
                                    .toString();
                            }
                        }
                        let strpath = newPath.replaceAll(",", "/");
                        socket.emit("create-new-folder", {
                            path: strpath,
                            foldername
                        });
                        input.value = "";
                        closeInput();
                    } else {
                        showError(`Folder "${foldername}" already exists!`);
                    }
                });
            }
        };
        input.onblur = closeInput;
    };
    const renameItem = () => {
        if (!selectedItem) return;
        isEditing = true;

        let input = document.createElement("input");
        input.style.padding = ".3rem 1rem";
        input.style.outline = "none";
        input.style.width = "90%";
        input.style.borderRadius = "5px";
        input.style.border = "1.5px solid #0083c2";
        input.value = selectedItem.name;
        input.setAttribute("enterkeyhint", "go");
        selectedItem.span.innerHTML = "";
        selectedItem.span.appendChild(input);
        input.focus();

        input.onkeyup = e => {
            if (e.key === "Enter" || e.keyCode === 13) {
                const newName = input.value.trim();
                if (!newName) return;
                isExist([currentFolder], newName, selectedItem.type, exists => {
                    if (!exists) {
                        // TODO: Socket will be call here...
                        let project = localStorage.getItem("project-name");
                        let fpath = currentFolder.path + selectedItem.name;
                        let trimfpath = fpath.split("/");
                        let newPath;
                        for (let i = 0; i < trimfpath.length; i++) {
                            if (trimfpath[i] === project) {
                                newPath = trimfpath
                                    .slice(i, trimfpath.length)
                                    .toString();
                            }
                        }
                        let oldpathName = newPath.replaceAll(",", "/");
                        let newpathName =
                            oldpathName.split("/")[0] + "/" + newName;
                        socket.emit("rename", {
                            oldpathName,
                            newpathName
                        });
                        // Update in tree structure
                        searchInTree(tree, selectedItem.name, "name", newName);
                        selectedItem.name = newName;
                        selectedItem.span.textContent = newName;

                        closeInput();
                        isEditing = false;
                    } else {
                        showError(
                            `A ${selectedItem.type} named "${newName}" already exists!`
                        );
                    }
                });
            }
        };

        input.onblur = () => {
            selectedItem.span.textContent = selectedItem.name; // Revert if cancelled
            isEditing = false;
        };
    };
    const deleteItem = () => {
        if (!selectedItem) return;
        // TODO: Socket will be call here...
        let project = localStorage.getItem("project-name");
        let fpath = selectedItem.path;

        let trimfpath = fpath.split("/");
        let newPath;
        for (let i = 0; i < trimfpath.length; i++) {
            if (trimfpath[i] === project) {
                newPath = trimfpath.slice(i, trimfpath.length).toString();
            }
        }
        let oldpathName = newPath.replaceAll(",", "/");
        // TODO : Socket will be call here...
        socket.emit("delete", { path: oldpathName, type: selectedItem.type });
        selectedItem.li.remove();
    };

    /* ... [REST OF YOUR ORIGINAL CODE REMAINS THE SAME] ... */

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
                    // console.log(`Selected file: ${item.name}`);
                    // console.log(item.path);
                    let fileName = item.name;
                    let fileType = item.name.split(".");
                    let type = fileType[fileType.length - 1];
                    createFileTab(fileName, type, item.path);
                    document
                        .querySelector(".sidebar")
                        .classList.remove("mobile-menu");
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

                contextMenu.style.left = `${50}px`;
                contextMenu.style.top = `${200}px`;
                contextMenu.classList.add("active");

                // Log the clicked item after 2.5 seconds
                selectedItem = {
                    name: e.target.getAttribute("data-name"),
                    type: e.target.getAttribute("data-type"),
                    path: e.target.getAttribute("data-path"),
                    span: e.target.querySelector("span"),
                    element: li,
                    li: e.target.parentElement
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

    // generateTree(folderStructure, treeRoot);
    /*
    editor.setOption("fontFamily", "fira-code");
    editor.renderer.updateFontSize();
    editor.renderer.updateText();
    setTimeout(() => {
        editor.resize(true);
        editor.renderer.updateFull(); // Force full re-render
    }, 50);
    */

    const treeRoot = document.getElementById("tree-root");
    socket.on("folder-structure", async data => {
        if (await data) {
            const folders = JSON.parse(data);
            generateTree([folders], treeRoot);
            tree = [folders];
            document.querySelector(".pre-loader").style.display = "none";
        }
    });
});
