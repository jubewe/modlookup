const _log = require("../functions/_log");
const _stackname = require("../functions/_stackname");
const _wf = require("../functions/_wf");
const _getallobjectkeystree = require("../functions/_getallobjectkeystree");
const _getbyobjectkeyfromtree = require("../functions/_getbyobjectkeyfromtree");
const isdebug = require("../functions/isdebug");
const files = require("../variables/files");
const paths = require("../variables/paths");

let filesold = {};
module.exports = () => {
    if(isdebug("filechange")){
        _log(1, `${_stackname("handlers", "filechange")[3]} executed`);
    };
    
    let changed_files = 0;

    function filechange(files_) {
        for(let file in files_){
            if(filesold[file] && filesold[file] !== JSON.stringify(files_[file]) && _getallobjectkeystree(paths).includes(file)){
                _wf(_getbyobjectkeyfromtree(paths, file)[0][0], files_[file], true);
                changed_files++;
            };
            filesold[file] = JSON.stringify(files_[file]);
        };
    };

    filechange(files);
    
    if(isdebug("filechange")){
        _log(1, `${_stackname("handlers", "filechange")[3]} executed\t(Changed ${changed_files} files)`);
    };
}