var fs = require('fs'),
    UglifyJS = require("uglify-js"),
    dir = 'modules/',
    outputFileName = 'index.js';

module.exports = function (grunt) {
    grunt.registerTask('build_module_index', 'Builds the module index', function () {
        var done = this.async();
        fs.readdir(dir, function (err, files) {
            if (err) {
                throw err;
            } else {
                var reqs = {},
                    realDirPath = fs.realpathSync(dir);
                for (var i = 0; i < files.length; i++) {
                    if (files[i].match(/\.mod.js$/)) {
                        var realPath = realDirPath + "/" + files[i],
                            req = require(realPath);

                        if (typeof(req.id) !== "string") {
                            throw new Error("Failed to parse " + files[i] + ": the ID field is mandatory.")
                        } else {
                            var readFile = UglifyJS.minify(realDirPath + "/" + files[i]).code.split("module.exports=")[1];
                            reqs[req.id] = readFile.substr(0, readFile.length - 1);
                        }
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