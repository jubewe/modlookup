const _log = require("../functions/_log");
const _stackname = require("../functions/_stackname");
const _wf = require("../functions/_wf");
const _getallobjectkeystree = require("../functions/_getallobjectkeystree");
const _getbyobjectkeyfromtree = require("../functions/_getbyobjectkeyfromtree");
const isdebug = require("../functions/isdebug");
let files = require("../variables/files");
let paths = require("../variables/paths");
const _rf = require("../functions/_rf");
const _sleep = require("../functions/_sleep");

let filesold = {};
module.exports = () => {
    if(isdebug("filechange")){
        _log(1, `${_stackname("handlers", "filechange")[3]} executed`);
    };
    
    let changed_files = 0;
    let readnew_files = 0;

    async function filechange(files_) {
        for(let file in files_){
            let filenew = _rf(_getbyobjectkeyfromtree(paths, file)[0][0], false);
            if(filesold[file] && filesold[file] !== JSON.stringify(files_[file]) && _getallobjectkeystree(paths).includes(file)){
                _wf(_getbyobjectkeyfromtree(paths, file)[0][0], files_[file], true);
                changed_files++;
                await _sleep(500);
            } else if(filesold[file] && filesold[file] === JSON.stringify(files_[file]) && filesold[file] != filenew && JSON.stringify(files_[file]) != filenew){
                filesold[file] = filenew;
                try {
                    files_[file] = JSON.parse(filenew);
                    // _wf(_getbyobjectkeyfromtree(paths, file)[0][0], JSON.stringify(JSON.parse(filenew)));
                    await _sleep(500);
                } catch(e){
                    files_[file] = filenew;
                }
                readnew_files++;
            };
            
            filesold[file] = JSON.stringify(files_[file]);
        };
    };

    filechange(files);
    
    if(isdebug("filechange")){
        _log(1, `${_stackname("handlers", "filechange")[3]} executed\t(Changed ${changed_files} and Re-read ${readnew_files} files)`);
    };
}