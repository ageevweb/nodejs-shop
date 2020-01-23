// "qwerty" : "gulp && nodemon app.js",


const {src, dest, task, series} = require("gulp");
const rm = require("gulp-rm");
const sass = require('gulp-sass');
const concat = require('gulp-concat');
 
sass.compiler = require('node-sass');

task( "clean", ()=> {
  return src( 'public/css/*', { read: false }).pipe(rm())
});

task( "copy", ()=> {
  return src('src/styles/*.scss').pipe(dest('public/css'));
});

task( "styles", ()=> {
  return src('src/styles/*.scss')
    .pipe(concat('main.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('public/css'));
});



task("default", series("clean", "styles"));





