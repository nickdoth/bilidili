var gulp = require('gulp');
var ts = require('gulp-typescript');
var webpack = require('webpack-stream');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('ts', function() {
    return gulp.src('./src/**/*')
    .pipe(ts.createProject('tsconfig.json')())
    .pipe(gulp.dest('./lib'));
});

gulp.task('crx', ['ts'], function() {
    return Promise.all([
        gulp.src('./lib/core.js').pipe(webpack({
            output: { filename: 'bilidili-core.js' }
        })).pipe(gulp.dest('crx/content-scripts')),
        gulp.src('./lib/control.js').pipe(webpack({
            output: { filename: 'bilidili-control.js' }
        })).pipe(gulp.dest('crx/content-scripts'))
    ].map(streamToPromise));
})


function streamToPromise(stream) {
    return new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
}