/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function (grunt) {
   'use strict';

   var pkg = grunt.file.readJSON('package.json');
   var bwr = grunt.file.readJSON('bower.json');
   var src = {
      gruntfile: 'Gruntfile.js',
      require: 'require_config.js',
      laxar: [pkg.name + '.js', 'lib/**/*.js', '!lib/**/spec/**/*.js'],
      specs: ['lib/**/spec/**/*.js'],
      docs: ['docs/**/*.md']
   };

   var testDirectories = [];

   function karma(lib) {
      var options = {
         files: [
            { pattern: 'bower_components/**', included: false },
            { pattern: 'static/**', included: false},
            { pattern: 'lib/**', included: false },
            { pattern: '*.js', included: false }
         ],
         laxar: {
            specRunner: 'lib/' + lib + '/spec/spec_runner.js',
            requireConfig: src.require
         },
         junitReporter: {
            outputFile: 'lib/' + lib + '/test/test-results.xml',
            suite: 'lib/' + lib
         },
         coverageReporter: {
            type: 'lcovonly',
            dir: 'lib/' + lib + '/test'
         },
         proxies: {
         }
      };

      testDirectories.push( 'lib/' + lib + '/test' );

      return { options: options };
   }

   grunt.registerTask( 'merge-test-results', function() {
      var done = this.async();
      var lcovInfos = grunt.file.expand( testDirectories.map( function( directory ) {
         return directory + '/PhantomJS */lcov.info';
      } ) );
      var testResults = testDirectories.map( function( directory ) {
         return directory + '/test-results.xml';
      } );

      grunt.log.ok( 'Merging lcov' );
      grunt.file.write( 'lcov.info', lcovInfos.map( grunt.file.read ).join( '\n' ) );
      grunt.log.ok( 'Merging test results' );
      grunt.file.write( 'test-results.xml', testResults.map( grunt.file.read ).map( function( text, index, array ) {
         var parts = text.split( /<[/]?testsuites[>]*>/m );
         parts.shift();
         parts.pop();
         if( index === 0 ) {
            parts.unshift( '<?xml version="1.0" encoding="utf-8"?>\n<testsuites>' );
         }
         if( index === array.length - 1 ) {
            parts.push( '</testsuites>' );
         }
         return parts.join( '' );
      } ).join( '' ) );
   } );

   grunt.initConfig({
      jshint: {
         options: {
            jshintrc: '.jshintrc'
         },
         gruntfile: {
            options: { node: true },
            src: src.gruntfile
         },
         laxar: { src: src.laxar },
         specs: { src: src.specs }
      },
      karma: {
         options: {
            basePath: '.',
            frameworks: ['laxar'],
            reporters: ['junit', 'progress', 'coverage'],
            browsers: ['PhantomJS'],
            plugins: [require('karma-coverage')],
            preprocessors: {
               'lib/**/*.js': 'coverage'
            },
            singleRun: true
         },
         event_bus: karma('event_bus'),
         'directives-layout': karma('directives/layout'),
         'directives-widget_area': karma('directives/widget_area'),
         file_resource_provider: karma('file_resource_provider'),
         i18n: karma('i18n'),
         json: karma('json'),
         logging: karma('logging'),
         'portal-modules': karma('portal/modules'),
         'portal-assembler': karma('portal/portal_assembler'),
         testing: karma('testing'),
         text: karma('text'),
         utilities: karma('utilities')
      },
      laxar_dox: {
         laxar: {
            files: [ {
               expand: true,
               src: [
                  'laxar.js',
                  'lib/event_bus/*.js',
                  'lib/i18n/*.js',
                  'lib/logging/*.js',
                  'lib/utilities/*.js',
                  'lib/testing/*.js'
               ],
               dest: 'docs/api/',
               ext: '.md'
            } ]
         }
      },
      markdown: {
         docs: {
            files: [ {
               expand: true,
               src: src.docs,
               dest: 'dist/',
               ext: '.html',
               rename: function (dest, src) {
                  return dest + src.replace(/\/README\.html$/, '/index.html');
               }
            } ]
         }
      },
      bower: {
         laxar: {
            rjsConfig: src.require,
            options: {
               baseUrl: './'
            }
         }
      },
      watch: {
         gruntfile: {
            files: src.gruntfile,
            tasks: ['jshint:gruntfile']
         },
         laxar: {
            files: src.laxar,
            tasks: ['jshint:laxar', 'karma']
         },
         specs: {
            files: src.specs,
            tasks: ['jshint:specs', 'karma']
         },
         docs: {
            files: src.docs,
            tasks: ['markdown']
         }
      }
   });

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-requirejs');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-bower-requirejs');
   grunt.loadNpmTasks('grunt-laxar');
   grunt.loadNpmTasks('grunt-markdown');

   grunt.registerTask('build', []);
   grunt.registerTask('test', ['karma', 'jshint', 'merge-test-results']);
   grunt.registerTask('default', ['build', 'test']);
};
