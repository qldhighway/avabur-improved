module.exports = function (grunt) {
    require('./lib/create-meta')(grunt);
    require('./lib/yui-modules')(grunt);
    require('./lib/build-module-index')(grunt);
    grunt.initConfig({
        browserify: {
            js: {
                src: 'avabur-improved.dev.js',
                dest: 'avabur-improved.user.js'
            }
        }
    });

    // Load the npm installed tasks
    grunt.loadNpmTasks('grunt-browserify');

    // The default tasks to run when you type: grunt
    grunt.registerTask('default', ['browserify', 'node_meta']);
};