// Karma configuration
// Generated on Wed Mar 04 2015 10:43:40 GMT+0100 (CET)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-ajax', 'jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'app/js/**/*.js'
        ],

        // list of files to exclude
        exclude: [
            'app/js/src/config-prod.js',
            'app/js/src/config-stag.js',
            'app/js/src/config-itest.js',
            'app/js/src/config-devnode.js',
            'app/js/src/config-testnode.js',
            'app/js/src/config-dev.js',
            'app/js/src/widgetRun.js',
            'app/**/*.json'
        ],

        // coverage reporter generates the coverage
        reporters: ['progress', 'coverage'],

        preprocessors: {
            'app/js/**/*.js': ['coverage']
        },

        // optionally, configure the reporter
        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
