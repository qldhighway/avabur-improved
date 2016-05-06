var SCSS_PATH = "res/css/avabur-improved.scss",
    OUT_PATH = "core/css.js",
    css = require('node-sass').renderSync({
        file: SCSS_PATH,
        outputStyle: "compressed"
    }).css.toString("utf8"),
    fs = require('fs').writeFileSync(OUT_PATH, "module.exports=" + JSON.stringify(css.trim()) + ";");