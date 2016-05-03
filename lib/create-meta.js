'use strict';
const fs = require('fs'),
    START_TAG = '==UserScript==',
    END_TAG = '==/UserScript==';

module.exports = function (grunt) {
    grunt.registerTask('node_meta', 'Create metablock from userscript', function (src, dest) {
        const done = this.async();

        if (!src || !dest) {
            throw new Error("The src and dest arguments are required");
        } else {
            fs.readFile(src, 'utf-8', function (err, contents) {
                if (err) {
                    throw err;
                } else {
                    contents = contents.split(END_TAG)[0].split(START_TAG);

                    if (contents.length == 2) {
                        contents = "// " + START_TAG + contents[1] + END_TAG + "\n";
                        fs.writeFileSync(dest, contents, 'utf8');
                        done(true);
                    } else {
                        throw new Error("Metablock not found");
                    }
                }
            });
        }
    });
};
