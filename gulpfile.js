// generated on 2017-06-12 using generator-webapp 3.0.1
const gulp = require('gulp');
const rename = require('gulp-rename');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');
const fileinclude = require('gulp-file-include');
const gulpif = require('gulp-if');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');

var dev = "dev";

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
    return gulp.src('src/styles/*.scss')
        .pipe($.plumber())
        .pipe($.if(dev == 'dev', $.sourcemaps.init()))
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] }))
        .pipe($.if(dev == 'dev', $.sourcemaps.write()))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({ stream: true }));
});

gulp.task('baseScripts', () => {
    return gulp.src('src/scripts/base/*.js')
        .pipe($.plumber())
        .pipe(gulp.dest('.tmp/scripts/base'))
        .pipe(reload({ stream: true }));
});

gulp.task('customScripts', () => {
    return gulp.src(['src/scripts/*.js', 'src/scripts/pages/*.js'], { base: './src/scripts' })
        .pipe($.plumber())
        .pipe($.if(dev == 'dev', $.sourcemaps.init()))
        .pipe($.babel())
        .pipe($.if(dev == 'dev', $.sourcemaps.write('.')))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(reload({ stream: true }));
});

function lint(files) {
    return gulp.src(files)
        .pipe($.eslint({ fix: true }))
        .pipe(reload({ stream: true, once: true }))
        .pipe($.eslint.format())
        .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
    return lint('src/scripts/**/*.js')
        .pipe(gulp.dest('src/scripts'));
});
gulp.task('lint:test', () => {
    return lint('test/spec/**/*.js')
        .pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['styles', 'baseScripts', 'customScripts'], () => {
    var result = gulp.src('src/**/*.html')
        .pipe($.if(/\.html$/, fileinclude({
            prefix: '@@',
            basepath: '@file'
        })))
        .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }));


    //     result = result.pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
    //         .pipe($.if(/\.css$/, $.cssnano({ safe: true, autoprefixer: false })))
    //         .pipe($.if(/\.html$/, $.htmlmin({
    //             collapseWhitespace: false,
    //             minifyCSS: true,
    //             minifyJS: { compress: { drop_console: true } },
    //             processConditionalComments: true,
    //             removeComments: true,
    //             removeEmptyAttributes: false,
    //             removeScriptTypeAttributes: true,
    //             removeStyleLinkTypeAttributes: true
    //         })))

    result.pipe(gulp.dest('dist'));
});

gulp.task('fileinclude', () => {
    return gulp.src('src/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe($.if(dev == 'dev', gulp.dest('.tmp'), gulp.dest('dist')));
});

gulp.task('images', () => {
    return gulp.src('src/images/**/*')
        .pipe($.cache($.imagemin()))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
    return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function(err) {})
            .concat('src/fonts/**/*'))
        .pipe($.if(dev == 'dev', gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('extras', () => {
    return gulp.src([
        'src/*',
        '!src/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});



gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
    runSequence(['clean'], ['fileinclude', 'styles', 'baseScripts', 'customScripts', 'fonts'], () => {
        browserSync.init({
            notify: false,
            port: 9000,
            server: {
                baseDir: ['.tmp', 'app'],
                routes: {
                    '/bower_components': 'bower_components'
                }
            },
            reloadDelay: 1000
        });

        gulp.watch([
            'src/**/*.html',
            'src/images/**/*',
            '.tmp/fonts/**/*'
        ]).on('change', reload);

        gulp.watch('src/**/*.html', ['fileinclude']);
        gulp.watch('src/styles/**/*.scss', ['styles']);
        gulp.watch('src/scripts/**/*.js', ['baseScripts', 'customScripts']);
        gulp.watch('src/fonts/**/*', ['fonts']);
        //gulp.watch('bower.json', ['fonts']);
    });
});

gulp.task('serve:dist', ['default'], () => {
    browserSync.init({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});

gulp.task('serve:test', ['baseScripts', 'customScripts'], () => {
    browserSync.init({
        notify: false,
        port: 9000,
        ui: false,
        server: {
            baseDir: 'test',
            routes: {
                '/scripts': '.tmp/scripts',
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch('src/scripts/**/*.js', ['baseScripts', 'customScripts']);
    gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
    gulp.watch('test/spec/**/*.js', ['lint:test']);
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
    return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task("revision", function() {
    return gulp.src(["dist/**/*.css", "dist/**/*.js"])
        .pipe(gulp.dest("dist/rev"))
        .pipe(rev())
        .pipe(gulp.dest("dist"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("dist"))
})

gulp.task("revreplace", ["revision"], function() {
    var manifest = gulp.src("dist/rev-manifest.json");

    return gulp.src("dist/**/*.html")
        .pipe(revReplace({ manifest: manifest }))
        .pipe(gulp.dest("dist"));
});



gulp.task('default', () => {
    dev = "prd";
    return new Promise(resolve => {
        runSequence(['clean'], 'build', resolve);
    });
});