/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function (grunt) {
   'use strict';

   var pkg = grunt.file.readJSON( 'package.json' );
   var src = {
      gruntfile: 'Gruntfile.js',
      require: 'require_config.js',
      laxar: [ pkg.name + '.js', 'lib/**/*.js', '!lib/**/spec/**/*.js' ],
      specs: [ 'lib/**/spec/**/*.js' ]
   };

   function karma(lib) {
      var options = {
         laxar: {
            specRunner: 'lib/' + lib + '/spec/spec_runner.js',
            requireConfig: src.require
         },
         junitReporter: {
            outputFile: 'lib/' + lib + '/spec/test-results.xml'
         },
         coverageReporter: {
            type: 'lcovonly',
            dir: 'lib/' + lib + '/spec',
            file: 'lcov.info'
         }
      };

      return { options: options };
   }

   var withSauce = !!process.env['SAUCE_USERNAME'];
   var customLaunchers = {
      'SauceChrome': {
         base: 'SauceLabs',
         browserName: 'chrome',
         platform: 'Linux',
         version: '42.0'
      },
      'SauceFirefox': {
         base: 'SauceLabs',
         browserName: 'firefox',
         platform: 'Linux',
         version: '37.0'
      },
      'SauceSafari': {
         base: 'SauceLabs',
         browserName: 'safari',
         platform: 'OS X 10.10',
         version: '8.0'
      },
      'SauceIphone': {
         base: 'SauceLabs',
         browserName: 'iphone',
         platform: 'OS X 10.10',
         version: '8.2'
      },
      'SauceIE10': {
         base: 'SauceLabs',
         browserName: 'internet explorer',
         platform: 'Windows 8',
         version: '10.0'
      },
      'SauceIE11': {
         base: 'SauceLabs',
         browserName: 'internet explorer',
         platform: 'Windows 8.1',
         version: '11.0'
      }
   };

   grunt.initConfig( {
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
            reporters: ['junit', 'coverage', 'progress'].concat(withSauce ? ['saucelabs'] : []),
            plugins: [ require('karma-sauce-launcher') ],
            sauceLabs: {
               testName: 'LaxarJS unit tests'
            },
            customLaunchers: customLaunchers,
            browsers: withSauce ? ['SauceChrome', 'SauceFirefox', 'SauceIE10'] : ['PhantomJS'],
            singleRun: true,
            preprocessors: {
               'lib/**/*.js': 'coverage'
            },
            proxies: {},
            files: [
               { pattern: 'bower_components/**', included: false },
               { pattern: 'static/**', included: false},
               { pattern: 'lib/**', included: false },
               { pattern: '*.js', included: false }
            ]
         },
         'directives-id': karma( 'directives/id' ),
         'directives-layout': karma( 'directives/layout' ),
         'directives-widget_area': karma( 'directives/widget_area' ),
         event_bus: karma( 'event_bus' ),
         file_resource_provider: karma( 'file_resource_provider' ),
         i18n: karma( 'i18n' ),
         json: karma( 'json' ),
         loaders: karma( 'loaders' ),
         logging: karma( 'logging' ),
         profiling: karma( 'profiling' ),
         runtime: karma( 'runtime' ),
         testing: karma( 'testing' ),
         utilities: karma( 'utilities' ),
         widget_adapters: karma( 'widget_adapters' )
      },
      test_results_merger: {
         laxar: {
            src: [ 'lib/**/spec/test-results.xml' ],
            dest: 'test-results.xml'
         }
      },
      lcov_info_merger: {
         laxar: {
            src: [ 'lib/**/spec/*/lcov.info' ],
            dest: 'lcov.info'
         }
      },
      watch: {
         gruntfile: {
            files: src.gruntfile,
            tasks: [ 'jshint:gruntfile' ]
         },
         laxar: {
            files: src.laxar,
            tasks: [ 'jshint:laxar', 'karma' ]
         },
         specs: {
            files: src.specs,
            tasks: [ 'jshint:specs', 'karma' ]
         }
      }
   } );

   grunt.loadNpmTasks( 'grunt-contrib-jshint' );
   grunt.loadNpmTasks( 'grunt-contrib-watch' );
   grunt.loadNpmTasks( 'grunt-laxar' );

   grunt.registerTask( 'test', [ 'karma', 'test_results_merger', 'lcov_info_merger', 'jshint' ] );
   grunt.registerTask( 'default', [ 'test' ] );
};
