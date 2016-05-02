module.exports = function (grunt) {
    grunt.initConfig({
        browserify: {
            js: {
                // A single entry point for our app
                src: 'avabur-improved.dev.js',
                // Compile to a single file to add a script tag for in your HTML
                dest: 'avabur-improved.user.js'
            }
        }
    });

    // Load the npm installed tasks
    grunt.loadNpmTasks('grunt-browserify');

    // The default tasks to run when you type: grunt
    grunt.registerTask('default', ['browserify']);
};