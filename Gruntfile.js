module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		advSettings: grunt.file.readYAML('data/advancedSettings.yml'),

		jshint: {
			files: ['source/app/javascript/**/*.js'],
			options: {jshintrc: '.jshintrc'}
		},

		clean: {

			build: ['build/app/javascript/*'],
			jsLib: ['build/lib']

		},

		uglify: {
		},

		concat: {
			options: {
				separator: ';'
			}
		},

		requirejs: {
			viewer: {
				options: {
					baseUrl: "source",
					paths: {
						'dojo': 'empty:',
						'esri': 'empty:',
						'dijit': 'empty:',
						'dojox': 'empty:',
						'storymaps': 'app/javascript',
						'lib': 'lib'
					},
					name: 'resources/buildTools/config/ConfigViewer',
					out: 'build/app/javascript/<%= advSettings.appIdentifier %>-viewer.min.js'
				}
			}
		}

	});

	// Load plugins.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Default task(s).
	grunt.registerTask('default', [

		'jshint',
		'clean:build',

		/*
		* Minify project JS using require.js
		* - require.js output a .js for with only the viewer and a .js with viewer and builder
		* - concat those .js with lib's JS
		* - perform production mode replacement in JS files
		*/
		'requirejs'

	]);

};