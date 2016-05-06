module.exports = function (grunt) {
    require('./tools/build-module-index')(grunt);
    require('./tools/create-meta')(grunt);
    require('./tools/copy-meta')(grunt);
    require('./tools/inlineHTML')(grunt);
    grunt.initConfig({
        browserify: {
            js: {
                src: 'avabur-improved.dev.js',
                dest: 'avabur-improved.user.js'
            }
        },
        copy_meta: {
            options: {
                src: 'avabur-improved.dev.js',
                dest: 'avabur-improved.user.js'
            }
        },
        uglify: {
            options: {
                compress: true,
                mangle: true
            },
            my_target: {
                files: {
                    'avabur-improved.user.js': ['avabur-improved.user.js']
                }
            }
        }
    });

    // Load the npm installed tasks
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('dev', ['build_module_index', 'inline_html', 'node_meta', 'browserify']);
    grunt.registerTask('release', ['common', 'uglify', 'copy_meta']);
    grunt.registerTask('browserify-min', ['browserify', 'uglify', 'copy_meta']);
};