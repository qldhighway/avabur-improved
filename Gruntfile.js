module.exports = function (grunt) {
    require('./tools/build-module-index')(grunt);
    require('./tools/create-meta')(grunt);
    require('./tools/copy-meta')(grunt);
    require('./tools/inlineHTML')(grunt);
    require('./tools/scss')(grunt);
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

    grunt.registerTask('dev', ['build_module_index', 'inline_html', 'node_meta', 'scss', 'browserify']);
    grunt.registerTask('release', ['dev', 'uglify', 'copy_meta']);
};