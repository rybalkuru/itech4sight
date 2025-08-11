import gulp from "gulp";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import del from "del";
import rename from "gulp-rename";
import replace from "gulp-replace";
import browserSync from "browser-sync";

import rollupStream from "@rollup/stream";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import terser from "gulp-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const sass = gulpSass(dartSass);
const bs = browserSync.create();

// Очистка dist
export const clean = () => del(["dist"]);

// Компиляция SCSS → CSS (в dist/css)
export const styles = () => {
    return gulp
        .src("src/scss/main.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest("dist/css")) // <-- dist
        .pipe(bs.stream()); // inject css без полной перезагрузки
};

// Сборка JS с Rollup + минификация (в dist/js)
export const scripts = () => {
    return rollupStream({
        input: "src/js/main.js",
        output: {
            file: "dist/js/main.js",
            format: "iife",
            sourcemap: true,
            name: "bundle",
        },
        plugins: [resolve(), commonjs()],
    })
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(terser())
        .pipe(gulp.dest("dist/js")) // <-- dist
        .pipe(bs.stream());
};

// Обработка HTML — замена путей и переименование в php (для билда)
export const html = () => {
    return gulp
        .src("src/**/*.html")
        .pipe(replace(/dist\//g, "<?= SITE_TEMPLATE_PATH ?>/"))
        .pipe(gulp.dest("dist"));
};

// Копирование картинок и видео в dist
export const assets = () => {
    return gulp
        .src(["src/**/*.{jpg,jpeg,png,svg,gif,webp,mp4,webm}"])
        .pipe(gulp.dest("dist"));
};

// Копирование шрифтов в dist
export const fonts = () => {
    return gulp
        .src("src/fonts/**/*.{woff,woff2,ttf,eot,otf}")
        .pipe(gulp.dest("dist/fonts"));
};

// Локальный сервер для разработки (смотрит dist)
export const serve = () => {
    bs.init({
        server: {
            baseDir: "dist", // <-- dist
        },
        port: 3000,
        notify: false,
    });

    gulp.watch("src/scss/**/*.scss", styles);
    gulp.watch("src/js/**/*.js", scripts);
    gulp.watch("src/**/*.html", html).on("change", bs.reload);
    gulp.watch("src/fonts/**/*.{woff,woff2,ttf,eot,otf}", fonts).on(
        "change",
        bs.reload
    );
    gulp.watch("src/**/*.{jpg,jpeg,png,svg,gif,webp,mp4,webm}", assets).on(
        "change",
        bs.reload
    );
};

// Полный билд в dist
export const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, html, assets, fonts)
);

// dev: билд и запуск сервера с наблюдением
export const dev = gulp.series(build, serve);

// по умолчанию — dev
export default dev;
