var fs = require('fs'),
    sourceDir = "res/html",
    targetFile = "core/html.js",
    minify = require('html-minifier').minify;

module.exports = function (grunt) {
    grunt.registerTask('inline_html', 'Turns the HTML files into a nice little object', function () {
        var files = fs.readdirSync(sourceDir, 'utf8'),
            currFileName;
        if (files) {
            var json = {};
            for (var i = 0; i < files.length; i++) {
                currFileName = files[i].replace(/\.html/g, "");
                json[currFileName] = minify(fs.readFileSync(fs.realpathSync(sourceDir + "/" + files[i]), 'utf8'), {
                    collapseWhitespace: true,
                    conservativeCollapse: true
                });
            }
            fs.writeFileSync(targetFile, "module.exports=" + JSON.stringify(json) + ";");
        }
    });
};