'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const argv = require('yargs').argv;
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');

/**
 * Istanbul coverage
 */
gulp.task('pre-test', () => {
    return gulp.src([
        '**/*.js',
        '!GulpFile.js',
        '!coverage/**',
        '!test/**',
        '!node_modules/**',
        '!public/**',
        '!views/**'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

/**
 * Mocha tests and coverage report
 */
gulp.task('test', ['pre-test'], () => {
    const stream = gulp.src(['test/**/*.js'], { read: false })
        .pipe(mocha({
            ui: 'bdd',
            timeout: 5000,
            slow: 50,
            reporter: 'spec',
            recursive: true,
            require: ['./test/common']
        }));
    if (!argv.noReport) stream.pipe(istanbul.writeReports());

    return stream.pipe(istanbul.enforceThresholds({ thresholds: { global: 10 } })) // TODO increase the limit to mandate coverage
        .once('error', err => {
            console.error(err); // eslint-disable-line no-console
            return process.exit(1);
        })
        .once('end', () => {
            return process.exit(0);
        });
});

gulp.task('eslint', () => {
    return gulp.src(['**/*.js', 'bin/www', '!coverage/**/*.js', '!tools/**/*.js'])
        .pipe(eslint({
            useEslintrc: true
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .on('error', err => {
            console.error(err); // eslint-disable-line no-console
            process.exit(1);
        });
});

gulp.task('fix', () => {
    const isFixed = file => file.eslint && file.eslint.fixed;

    return gulp.src(['**/*.js', '**/www', '!coverage/**/*.js', '!tools/**/*.js'])
        .pipe(eslint({
            useEslintrc: true,
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, gulp.dest('./')));
});


/**
 * Global check
 */
gulp.task('check', ['eslint', 'test']);

/**
 * Pre-push hook
 */
gulp.task('pre-push', ['check']);

/**
 * Default task
 */
gulp.task('default', ['check']);
