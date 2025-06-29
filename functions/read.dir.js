const fs = require("fs").promises;
const path = require("path");

async function getFolderStructure(dirPath, projectName) {
    try {
        // Read the directory contents
        const items = await fs.readdir(dirPath);
        if (items.length > 0) {
            return Promise.all(
                items.map(async item => {
                    const itemPath = path.join(dirPath, item);
                    const stats = await fs.stat(itemPath);

                    if (stats.isDirectory()) {
                        // If it's a directory, recursively get its contents
                        const child = await getFolderStructure(itemPath);
                        return {
                            name: item,
                            type: "folder",
                            path: itemPath,
                            children: child.length > 0 ? child : [{}]
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
        } else {
            return [{}];
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [{}];
    }
}

async function readDir(rootPath, selectedFolder) {
    const folderStructure = await getFolderStructure(rootPath, selectedFolder);
    // await fs.writeFile(
    //         "./files.json",
    //         JSON.stringify(folderStructure, null, 4)
    //     );
    // console.log("exported folderStructure;");
    return {
        name: selectedFolder,
        type: "folder",
        path: path.join(__dirname, selectedFolder)+"/",
        children: folderStructure 
    };
}

/*
console.clear();
readDir("../public", "demo").then(data => {
    console.log(data);
});
*/
// Get the path from command line arguments or use current directory
module.exports = readDir;
