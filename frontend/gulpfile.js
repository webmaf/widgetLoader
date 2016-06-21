'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var exec = require('child_process').exec;
var notify = require('gulp-notify');
var argv = require('yargs').argv;
var karma = require('gulp-karma');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var sourcemaps = require('gulp-sourcemaps');
var tar = require('gulp-tar');
var rimraf = require('rimraf');
var shell = require('gulp-shell');
var wrap = require("gulp-wrap");

var env = (argv.env !== undefined) ? argv.env.toLowerCase() : 'local';

// ----------------------------
// Error notification methods
// ----------------------------
var beep = function () {
    var os = require('os');
    var file = 'gulp/error.wav';
    if (os.platform() === 'linux') {
        // linux
        exec("aplay " + file);
    } else {
        // mac
        console.log("afplay " + file);
        exec("afplay " + file);
    }
};
var handleError = function (task) {
    return function (err) {
        beep();

        notify.onError({
            message: task + ' failed, check the logs..',
            sound: false
        })(err);

        gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));
    };
};

gulp.task('clean', function (cb) {
    return rimraf('app/deploy', cb);
});

gulp.task('sass', function () {
    var local = env === 'local';

    return gulp.src('./app/scss/*.scss')
        // sourcemaps + sass + error handling
        .pipe(gulpif(local, sourcemaps.init()))
        .pipe(sass({
            sourceComments: local,
            outputStyle: !local ? 'compressed' : 'expanded'
        }))
        .on('error', handleError('SASS'))
        // generate .maps
        .pipe(gulpif(local, sourcemaps.write({
            'includeContent': false,
            'sourceRoot': '.'
        })))
        // autoprefixer
        .pipe(gulpif(local, sourcemaps.init({
            'loadMaps': true
        })))
        .pipe(postcss([autoprefixer({browsers: ['last 2 versions', 'IE 9', 'IE 10']})]))
        // we don't serve the source files
        // so include scss content inside the sourcemaps
        .pipe(sourcemaps.write({
            'includeContent': true
        }))
        // write sourcemaps to a specific directory
        // give it a file and save
        .pipe(gulp.dest('./app'));
});

gulp.task('tar', function () {
    if (argv.env === 'dev') {
        runSequence(['latest']);
    }
    return gulp.src(
        [
            './app/widgetloader.js',
            './app/global-widget.css',
            './app/*.html',
            './app/**/fonts/*'
        ]
    )
        .pipe(tar('widgetloader_' + env + '.tar'))
        .pipe(gulp.dest('app/deploy'));
});

gulp.task('latest', function () {
    return gulp.src(
        [
            './app/widgetloader.js',
            './app/global-widget.css',
            './app/*.html',
            './app/**/fonts/*'
        ]
    )
        .pipe(tar('widgetloader-LATEST-SNAPSHOT.tar'))
        .pipe(gulp.dest('app/deploy'));
});

gulp.task('karma', function () {
    return gulp.src(
        [
            'app/js/src/*.js',
            'app/test/*.spec.js'
        ]
    )
        .pipe(karma({
            configFile: process.cwd() + '/karma.conf.js',
            singleRun: true
        }));
});

gulp.task('javascript', function () {
    return gulp.src(
        [
            './app/js/src/widgetUtils.js',
            './app/js/src/widgetLogging.js',
            './app/js/src/widgetLoader.js',
            './app/js/src/config-' + env + '.js',
            './app/js/src/widgetRun.js'
        ]
    )
        .pipe(concat('widgetloader.js'))
        .pipe(gulp.dest('./app'));
});

gulp.task('wrap', function () {
    return gulp.src('./app/widgetloader.js')
        .pipe(wrap({src: './app/js/src/ie-hack-template.txt'}))
        .pipe(gulp.dest('./app'));
});

gulp.task('startBackend', function () {
    return gulp.src('app', {read: false})
        .pipe(shell([
            'cd ../backend/widgetloader-service; gradle bootRun -Dspring.profiles.active=mock'
        ]));
});

// --------------------------
// DEV/WATCH TASK
// --------------------------
gulp.task('watch', function () {
    gulp.watch(['./app/js/src/*.js', './app/test/*.spec.js'], ['karma']);
    gulp.watch('./app/scss/**/*.scss', ['sass']);
    gulp.watch('./app/js/*.html');
    gulp.watch('./app/js/src/*.js', ['javascript']);
    gutil.log(gutil.colors.green('---- Watching for changes ... YaY'));
});

gulp.task('jenkinsbuild', function () {
    gutil.log(gutil.colors.yellow('---- Environment: ' + env));
    runSequence(
        ['sass', 'karma', 'javascript'],
        ['wrap'],
        ['tar']
    );
});

gulp.task('local', function () {
    runSequence(
        ['startBackend']
    );
    runSequence(
        ['sass', 'karma', 'javascript'],
        //['wrap'],
        ['watch']
    );
});

gulp.task('default', ['local']);