const { readdirSync, statSync } = require("fs");
const { join } = require("path");

module.exports = (dir = "./", _files = []) => {
    walk(dir);
    function walk(dir) {
        const others = ["node_modules", ".git", "README.md", ".gitignore"]
        readdirSync(dir).filter(f => !others.includes(f)).forEach(f => {
            let dirPath = join(dir, f);
            _files.push(dirPath);
            if (statSync(dirPath).isDirectory()) walk(dirPath);
        });
    }
    
    return _files.filter(f => f.includes(".js")).map(m => './' + m.replace(/\\/g, "/").replace("./", ""));
}