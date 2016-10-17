module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'client/final-u.min.js': [
            'client/modules/*.js', 'client/controllers/*.js',
            'client/factories/*.js', 'client/directives/*.js'
          ],
          'client/socketIO.min.js': 'node_modules/socket.io-client/socket.io.js'
        }
      }
    },
    htmlmin: {
      src: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'client/views/min/home.html': 'client/views/home.html',
          'client/views/min/splash.html': 'client/views/splash.html',
          'client/minIndex.html': 'client/index.html'
        }
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'client/styles',
          src: [
            '*.css', '!*.min.css'
          ],
          dest: 'client/styles',
          ext: '.min.css'
        }]
      }
    },
    concat: {
      options: {
        separator: '\n'
      },
      css: {
        src: ['bower_components/bootstrap/dist/css/bootstrap.min.css',
          'client/styles/style.min.css'
        ],
        dest: 'client/styles/style.min.css'
      },
      depJS: {
        src: ['bower_components/angular/angular.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/angular-cookies/angular-cookies.min.js',
          'bower_components/jquery/dist/jquery.min.js',
          'node_modules/soundmanager2/script/soundmanager2-jsmin.js',
          'client/socketIO.min.js',
          'client/final-u.min.js'
        ],
        dest: 'client/depAndLocJS.min.js'
      }
    },
    watch: {
      files: [
        'client/controllers/*.js',
        'client/directives/*.js',
        'client/factories/*.js',
        'client/modules/*.js',
        'client/assets/*.*',
        'client/styles/style.css',
        'client/index.html',
        'index.js',
        'package.json',
        'bower.json',
        'Gruntfile.js'
      ],
      tasks: ['cssmin', 'htmlmin', 'uglify', 'concat']
    }
  });

  // Tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default setting
  grunt.registerTask('default', ['watch']);
}
