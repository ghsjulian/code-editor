const fs = require("fs")
const path = require("path")


const readFile = async (path)=>{
    const data = await fs.readFileSync(path,"UTF-8")
    return data
}

module.exports = readFile