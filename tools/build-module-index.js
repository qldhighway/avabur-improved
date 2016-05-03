var fs = require('fs');

module.exports = function (grunt) {
    grunt.registerTask('build_module_index', 'Builds the module index', function (dir, outputFileName) {
        var done = this.async();
        fs.readdir(dir, function (err, files) {
            if (err) {
                throw err;
            } else {
                var reqs = {},
                    realDirPath = fs.realpathSync(dir);
                for (var i = 0; i < files.length; i++) {
                    if (files[i].match(/\.min.js$/)) {
                        var realPath = realDirPath + "/" + files[i],
                            readFile = fs.readFileSync(realPath, 'utf8').split("module.exports=")[1],
                            id = require(realPath).id;
                        reqs[id] = readFile.substr(0, readFile.length - 1);
                    }
                }
                var ids = Object.keys(reqs);
                var modExports = 'module.exports={"' + ids[0] + '":' + reqs[ids[0]];
                for (i = 1; i < ids.length; i++) {
                    modExports += ',"' + ids[i] + '":' + reqs[ids[i]];
                }
                fs.writeFileSync(realDirPath + "/" + outputFileName, modExports + "}");
                done(true);
            }
        });
    });
};