'use strict';
const fs = require('fs'),
    getmeta = require('./get-meta');

module.exports = function (grunt) {
    grunt.registerTask('copy_meta', 'Copy metablock to minified userscript', function () {
        var opts = this.options();
        if (!opts.src || !opts.dest) {
            throw new Error("The src and dest arguments are required");
        } else {
            fs.writeFileSync(opts.dest, getmeta(opts.src) + fs.readFileSync(opts.dest), 'utf8');
        }
    });
};
