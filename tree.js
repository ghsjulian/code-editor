const fs = require('fs');
const path = require('path');

/**
 * Recursively gets the folder structure starting from a given directory
 * @param {string} dirPath - The starting directory path
 * @returns {Array} Array of objects representing the folder structure
 */
function getFolderStructure(dirPath) {
    try {
        // Read the directory contents
        const items = fs.readdirSync(dirPath);
        
        return items.map(item => {
            const fullPath = path.join(dirPath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                // If it's a directory, recursively get its contents
                return {
                    name: item,
                    type: 'folder',
                    path: fullPath,
                    children: getFolderStructure(fullPath)
                };
            } else {
                // If it's a file, return file info
                return {
                    name: item,
                    type: 'file',
                    path: fullPath
                };
            }
        });
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
    }
}

/**
 * Main function to demonstrate the folder structure
 */
function main(rootPath) {
    const folderStructure = getFolderStructure(rootPath);
    fs.writeFileSync("./files.json",JSON.stringify(folderStructure, null, 4))
    // Output the structure in the desired format
    console.log(`const folderStructure = ${JSON.stringify(folderStructure, null, 4)};`);
    console.log('export default folderStructure;');
}

// Get the path from command line arguments or use current directory
main("./");
