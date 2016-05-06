var fs = require('fs'),
    START_TAG = '==UserScript==',
    END_TAG = '==/UserScript==';

module.exports = function (file) {
    var contents = fs.readFileSync(file, 'utf8');
    contents = contents.split(END_TAG)[0].split(START_TAG);

    if (contents.length == 2) {
        return "// " + START_TAG + contents[1] + END_TAG + "\n";
    } else {
        throw new Error("Metablock not found. Our content array is as follows: " + JSON.stringify(contents));
    }
};