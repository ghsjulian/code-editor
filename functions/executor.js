const { exec } = require("child_process");

/**
 * Executes a shell command from the user's home directory and returns the output.
 * @param {string} command - The command to execute.
 * @returns {Promise<string>} - A promise that resolves with the command output or rejects with an error.
 */
function executeCommand(command) {
    // Change to the home directory and execute the command
    // const homeCommand = `c${command}`;

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error : ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Stderr : ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
}

// Example usage:
/*
executeCommand("ls -la")
    .then(output => {
        console.log("Command output:", output);
    })
    .catch(err => {
        console.error("Command failed:", err);
    });
*/
module.exports = executeCommand;
