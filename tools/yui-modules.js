'use strict';
const fs = require('fs'),
    compressor = require('yuicompressor');

module.exports = function (grunt) {
    grunt.registerTask('yui_modules', 'YUIs modules', function (fileIn, fileOut) {
        if (!fileIn || !fileOut) {
            throw new Error("fileIn and fileOut are required!");
        } else {
            const done = this.async();
            compressor.compress(fileIn, {
                charset: 'utf8',
                type: 'js',
                nomunge: false
            }, function (err, data, extra) {
                if (err) {
                    throw new Error(err);
                } else {
                    fs.writeFileSync(fileOut, data);
                    done(true);
                }
            });
        }
    });
};
