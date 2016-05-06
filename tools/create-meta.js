'use strict';
const fs = require('fs'),
    getmeta = require('./get-meta'),
    src = 'avabur-improved.dev.js',
    dest = 'avabur-improved.meta.js';

module.exports = function (grunt) {
    grunt.registerTask('node_meta', 'Create metablock from userscript', function () {
        if (!src || !dest) {
            throw new Error("The src and dest arguments are required");
        } else {
            fs.writeFileSync(dest, getmeta(src), 'utf8');
        }
    });
};
