module.exports = function (grunt) {
    require('./tools/build-module-index')(grunt);
    require('./tools/create-meta')(grunt);
    require('./tools/copy-meta')(grunt);
    require('./tools/yui-modules')(grunt);
    grunt.initConfig({
        browserify: {
            js: {
                src: 'avabur-improved.dev.js',
                dest: 'avabur-improved.user.js'
            }
        },
        'min': {
            'dist': {
                'src': ['avabur-improved.user.js'],
                'dest': 'avabur-improved.user.js'
            }
        },
        copy_meta: {
            options: {
                src: 'avabur-improved.dev.js',
                dest: 'avabur-improved.user.js'
            }
        }
    });

    // Load the npm installed tasks
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-yui-compressor');

    // The default tasks to run when you type: grunt
    grunt.registerTask('browserify-min', ['browserify', 'min', 'copy_meta']);
};