var gulp = require('gulp');
var ts = require('gulp-typescript');
var webpack = require('webpack-stream');
var fs = require('pn/fs');
var svg2png = require('svg2png');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('ts', function() {
    return gulp.src('./src/**/*')
    .pipe(ts.createProject('tsconfig.json')())
    .pipe(gulp.dest('./lib'));
});

gulp.task('crx', ['ts'], function() {
    console.log('Building crx...');
    return Promise.all([
        gulp.src('./lib/core.js').pipe(webpack({
            output: { filename: 'bilidili-core.js' }
        })).pipe(gulp.dest('crx/content-scripts')),
        gulp.src('./lib/control.js').pipe(webpack({
            output: { filename: 'bilidili-control.js' }
        })).pipe(gulp.dest('crx/content-scripts'))
    ].map(streamToPromise));
});

gulp.task('icon', function() {
    console.log('Generating resources...');
    return Promise.all([
        icon(128), icon(16), icon(19), icon(38)
    ]);
});

gulp.task('all', ['icon', 'crx'], function() {});

function icon(size) {
    return fs.readFile('./bilidili.svg')
        .then((buf) => svg2png(buf, { width: size }))
        .then(buf => fs.writeFile(`./crx/images/icon-${size}.png`, buf));
}

function streamToPromise(stream) {
    return new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
}