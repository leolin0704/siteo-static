
const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const fileinclude = require('gulp-file-include');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync').create();

const deployBase = 'dist/';
const paths = {
    styles: {
      src: 'src/styles/**/*.scss',
      dest: `${deployBase}styles/`
    },
    scripts: {
      src: 'src/scripts/**/*.js',
      dest: `${deployBase}scripts/`
    },
    html: {
      src: 'src/*.html',
      dest: deployBase
    },
    components: {
      src: 'src/components/*.html',
    },
    assets:{
      src: 'src/assets/*.*',
      dest: `${deployBase}assets`
    }
  };

  function clean() {
    return del([ deployBase ]);
  }

  function styles() {
    return gulp.src(paths.styles.src)
      .pipe(sass())
      .pipe(cleanCSS())
      // pass in options to the stream
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(gulp.dest(paths.styles.dest));
  }
   
  function scripts() {
    return gulp.src(paths.scripts.src, { sourcemaps: true })
      .pipe(babel())
      .pipe(uglify())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(gulp.dest(paths.scripts.dest));
  }

  function assets() {
    return gulp.src(paths.assets.src)
      .pipe(gulp.dest(paths.assets.dest));
  }

  function html(){
      return gulp.src(paths.html.src)
      .pipe(fileinclude({
        prefix: '@@',
        basepath: 'src/components'
      }))
      .pipe(gulp.dest(paths.html.dest));
  }
   
  function watch() {
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.html.src, html);
    gulp.watch(paths.components.src, html);
    gulp.watch(paths.assets.src, assets);
  }

  /*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.assets = assets;
exports.watch = watch;
 
/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(clean, gulp.parallel(styles, scripts, assets, html));
 
/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task('build', build);
 
/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);

gulp.task('start', function(){
  build(function(){
    browserSync.init({
      port: 3000,
      server: {
        baseDir: ['dist'],
        routes: {
          '/node_modules' : 'node_modules',
        }
      },
      reloadDelay: 2000,
    });

    watch();

  });
})
