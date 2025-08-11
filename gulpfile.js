import gulp from "gulp";
import dartSass from "sass";
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

const sass = gulpSass(dartSass);
const bs = browserSync.create();

// Очистка dist
export const clean = () => del(["dist"]);

// Компиляция SCSS → CSS (в src/css для dev)
export const styles = () => {
    return gulp
        .src("src/scss/agrosainsurance.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest("src/css"))
        .pipe(bs.stream());
};

// Сборка JS с Rollup + минификация в src/js/main.js
export const scripts = () => {
    return rollupStream({
        input: "src/js/main.js",
        output: {
            format: "iife", // для браузера (можно 'esm', но для поддержки лучше iife)
            sourcemap: true,
        },
    })
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(terser())
        .pipe(gulp.dest("src/js"))
        .pipe(bs.stream());
};

// Обработка HTML — замена путей и переименование в php (для билда)
export const html = () => {
    return gulp
        .src("src/**/*.html")
        .pipe(replace(/dist\//g, "<?= SITE_TEMPLATE_PATH ?>/"))
        .pipe(rename({ extname: ".php" }))
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

// Локальный сервер для разработки
export const serve = () => {
    bs.init({
        server: {
            baseDir: "src",
        },
        port: 3000,
        notify: false,
    });

    gulp.watch("src/scss/**/*.scss", styles);
    gulp.watch("src/js/**/*.js", scripts);
    gulp.watch("src/**/*.html").on("change", bs.reload);
    gulp.watch("src/fonts/**/*.{woff,woff2,ttf,eot,otf}").on(
        "change",
        bs.reload
    );
    gulp.watch("src/**/*.{jpg,jpeg,png,svg,gif,webp,mp4,webm}").on(
        "change",
        bs.reload
    );
};

// Полный билд в dist
export const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, html, assets, fonts)
);

// Задача по умолчанию — сборка и запуск сервера
export default gulp.series(gulp.parallel(styles, scripts), serve);
