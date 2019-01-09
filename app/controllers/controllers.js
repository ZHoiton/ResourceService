const file_system = require("fs");
let controllers_module = {};

//spliting the path by "\" if the os is windows, other wise with "/" as in other os`s normal slash is used
const _filename = process.platform.indexOf("win") > -1 ? __filename.split("\\") : __filename.split("/");

//getting all the middlewares
const files = file_system.readdirSync(__dirname);

//if there are any controllers add them to the export
if (files.length > 1) {
    files.forEach(file => {
        if (file !== _filename[_filename.length - 1]) {
            let temp = require(`./${file}`);
            const controller_name = temp.name;
            //deleting the prop from the export object
            delete temp.name;
            controllers_module[controller_name] = temp;
        }
    });
}

module.exports = controllers_module;
