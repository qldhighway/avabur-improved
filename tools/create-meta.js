'use strict';
const fs = require('fs'),
    getmeta = require('./get-meta');

module.exports = function (grunt) {
    grunt.registerTask('node_meta', 'Create metablock from userscript', function (src, dest) {
        if (!src || !dest) {
            throw new Error("The src and dest arguments are required");
        } else {
            fs.writeFileSync(dest, getmeta(src), 'utf8');
        }
    });
};
