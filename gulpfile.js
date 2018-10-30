const gulp = require('gulp');
const del = require("del");
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const rename = require("gulp-rename");
const minify = require("gulp-csso");
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const imagemin = require("gulp-imagemin");
const webp = require('gulp-webp');
const run = require("run-sequence");
const browserSync = require('browser-sync').create();

const path = {
    src: {
        html: "./src/*.html",
        style: "./src/main.css",
        js: "./src/blocks/**/*.js",
        img: "./src/static/img/**/*.{png,jpg,svg}",
        fonts: './src/static/fonts/**/*.{woff,woff2}'
    },
    build: {
        html: "build/",
        style: "build/css/",
        js: "build/js",
        img: "build/img",
        fonts: "build/fonts/"
    },
    clean: './build'
};

gulp.task("clean", () => {
    return del(path.clean);
});

gulp.task("html", () => {
    return gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
});

gulp.task("style", () => {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(rename("style.css"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.style))
        .pipe(browserSync.stream());
});

gulp.task("style:build", () => {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest(path.build.style));
});

gulp.task('script', () => {
    return gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js));
});

gulp.task('script:build', () => {
    return gulp.src(path.src.js)
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(rename("script.min.js"))
        .pipe(gulp.dest(path.build.js));
});

gulp.task("images", () => {
    return gulp.src(path.src.img)
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest(path.build.img));
});

gulp.task("images:build", () => {
    return gulp.src(path.src.img)
        .pipe(imagemin([
            imagemin.optipng({ optimizationLevel: 3 }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.svgo()
        ]))
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest(path.build.img));
});

gulp.task("images:webp", () => {
    return gulp.src(path.src.img)
        .pipe(webp())
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest(path.build.img));
});

gulp.task("fonts", () => {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task("default", function (done) {
    run(
        "clean",
        "fonts",
        "images:webp",
        "images",
        "script",
        "style",
        "html",
        done
    );
});

gulp.task("build", function (done) {
    run(
        "clean",
        "fonts",
        "images:webp",
        "images:build",
        "script:build",
        "style:build",
        "html",
        done
    );
});

gulp.task('watch', function () {
    browserSync.init({ server: path.build.html });
    gulp.watch(path.src.html, ["html"]);
    gulp.watch("../src/blocks/**/*.scss", ["style"]);
    gulp.watch(path.src.js, ["script"]);
});
