var SCSS_PATH = "res/css/avabur-improved.scss",
    OUT_PATH = "core/css.js",
    fs = require('fs'),
    sass = require('node-sass');

module.exports = function (grunt) {
    grunt.registerTask('scss', 'Builds our CSS', function () {
        var css = sass.renderSync({
            file: SCSS_PATH,
            outputStyle: "compressed"
        }).css.toString("utf8");

        fs.writeFileSync(OUT_PATH, "module.exports=" + JSON.stringify(css.trim()) + ";");
    });
};