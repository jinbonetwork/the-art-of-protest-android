var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var replace = require('replace');
var sh = require('shelljs');
var karmaServer = require('karma').Server;

var paths = {
	sass: ['./scss/**/*.scss']
};

var replaceFiles = ['./www/js/constants.js'];

gulp.task('default', ['sass']);

gulp.task('sass', function (done) {
	gulp.src('./scss/ionic.app.scss')
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(gulp.dest('./www/css/'))
		.pipe(minifyCss({
			keepSpecialComments: 0
		}))
		.pipe(rename({extname: '.min.css'}))
		.pipe(gulp.dest('./www/css/'))
		.on('end', done);
});

gulp.task('watch', function () {
	gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function () {
	return bower.commands.install()
		.on('log', function (data) {
			gutil.log('bower', gutil.colors.cyan(data.id), data.message);
		});
});

gulp.task('git-check', function (done) {
	if (!sh.which('git')) {
		console.log(
			'  ' + gutil.colors.red('Git is not installed.'),
			'\n  Git, the version control system, is required to download Ionic.',
			'\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
			'\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
		);
		process.exit(1);
	}
	done();
});

gulp.task('add-proxy', function () {
	return replace({
		regex: "MODE = 'PROD'",
		replacement: "MODE = 'DEV'",
		paths: replaceFiles,
		recursive: false,
		silent: false
	});
});

gulp.task('remove-proxy', function () {
	return replace({
		regex: "MODE = 'DEV'",
		replacement: "MODE = 'PROD'",
		paths: replaceFiles,
		recursive: false,
		silent: false
	});
});

gulp.task('test', function (done) {
	var karma = new karmaServer({
		configFile: __dirname + '/tests/test.conf.js',
		singleRun: true
	}, function () {
		done();
	});

	karma.start();
});
