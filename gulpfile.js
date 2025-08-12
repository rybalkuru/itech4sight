const gulp = require("gulp");
const dartSass = require("sass");
const gulpSass = require("gulp-sass");
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const browserSync = require("browser-sync").create();

const rollupStream = require("@rollup/stream");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const terser = require("gulp-terser");
const resolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs");

const sass = gulpSass(dartSass);

// Очистка dist
function clean() {
    return del(["dist"]);
}

// Компиляция SCSS → CSS в dist/css
function styles() {
    return gulp
        .src("src/scss/main.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(
            postcss([
                autoprefixer({
                    overrideBrowserslist: [
                        "last 2 versions",
                        "> 1%",
                        "not dead",
                    ],
                    cascade: false,
                }),
            ])
        )
        .pipe(cleanCSS())
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
}

// Сборка JS с Rollup + минификация в dist/js
function scripts() {
    return rollupStream({
        input: "src/js/main.js",
        output: {
            file: "main.js",
            format: "iife",
            sourcemap: true,
            name: "bundle",
        },
        plugins: [resolve(), commonjs()],
    })
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(terser())
        .pipe(gulp.dest("dist/js"))
        .pipe(browserSync.stream());
}


// Обработка HTML — замена путей и копирование в dist
function html() {
    return gulp
        .src("src/**/*.html")
        .pipe(replace(/dist\//g, "<?= SITE_TEMPLATE_PATH ?>/"))
        .pipe(gulp.dest("dist"));
}

// Копирование ассетов
function assets() {
    return gulp
        .src(["src/**/*.{jpg,jpeg,png,svg,gif,webp,mp4,webm}"])
        .pipe(gulp.dest("dist"));
}

// Копирование шрифтов
function fonts() {
    return gulp
        .src("src/fonts/**/*.{woff,woff2,ttf,eot,otf}")
        .pipe(gulp.dest("dist/fonts"));
}

// Сервер и слежение
function serve() {
    browserSync.init({
        server: {
            baseDir: "dist",
        },
        port: 3000,
        notify: false,
    });

    gulp.watch("src/scss/**/*.scss", styles);
    gulp.watch("src/js/**/*.js", scripts);
    gulp.watch("src/**/*.html", html).on("change", browserSync.reload);
    gulp.watch("src/fonts/**/*.{woff,woff2,ttf,eot,otf}", fonts).on(
        "change",
        browserSync.reload
    );
    gulp.watch("src/**/*.{jpg,jpeg,png,svg,gif,webp,mp4,webm}", assets).on(
        "change",
        browserSync.reload
    );
}

const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, html, assets, fonts)
);
const dev = gulp.series(build, serve);

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.assets = assets;
exports.fonts = fonts;
exports.build = build;
exports.serve = serve;
exports.dev = dev;
exports.default = dev;
