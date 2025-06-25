const fs = require("fs").promises;
const path = require("path");

async function getFolderStructure(dirPath) {
    try {
        // Read the directory contents
        const items = await fs.readdir(dirPath);

        return Promise.all(
            items.map(async item => {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);

                if (stats.isDirectory()) {
                    // If it's a directory, recursively get its contents
                    return {
                        name: item,
                        type: "folder",
                        path: itemPath,
                        children: await getFolderStructure(itemPath)
                    };
                } else {
                    // If it's a file, return file info
                    return {
                        name: item,
                        type: "file",
                        path: itemPath
                    };
                }
            })
        );
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
    }
}

async function readDir(rootPath, selectedFolder) {
    const folderStructure = await getFolderStructure(rootPath);
    // await fs.writeFile(
//         "./files.json",
//         JSON.stringify(folderStructure, null, 4)
//     );
    console.log("exported folderStructure;");
    return {
        name: selectedFolder,
        type: "folder",
        path: "/"+selectedFolder,
        children: folderStructure
    };
}

// Get the path from command line arguments or use current directory
module.exports = readDir;
