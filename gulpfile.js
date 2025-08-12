import gulp from "gulp";
import dartSass from "gulp-dart-sass";
import cleanCSS from "gulp-clean-css";
import del from "del";
import rename from "gulp-rename";
import replace from "gulp-replace";
import browserSync from "browser-sync";

import rollup from "gulp-better-rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "gulp-terser";
import babel from "gulp-babel";

const bs = browserSync.create();
const sass = dartSass;

// Очистка dist
export const clean = () => del(["dist"]);

// Компиляция SCSS → CSS
export const styles = () => {
    return gulp
        .src("src/scss/main.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest("dist/css"))
        .pipe(bs.stream());
};

// Сборка JS с Rollup + Babel + минификация
export const scripts = () => {
    return gulp
        .src("src/js/main.js")
        .pipe(
            rollup(
                {
                    plugins: [resolve(), commonjs()],
                },
                {
                    format: "iife",
                    sourcemap: true,
                    name: "bundle",
                }
            )
        )
        .pipe(
            babel({
                presets: ["@babel/preset-env"],
            })
        )
        .pipe(terser())
        .pipe(gulp.dest("dist/js"))
        .pipe(bs.stream());
};

// Копирование html с заменой путей
export const html = () => {
    return gulp
        .src("src/**/*.html")
        .pipe(replace(/dist\//g, "<?= SITE_TEMPLATE_PATH ?>/"))
        .pipe(gulp.dest("dist"));
};

// Копирование assets
export const assets = () => {
    return gulp
        .src(["src/**/*.{jpg,jpeg,png,svg,gif,webp,mp4,webm}"])
        .pipe(gulp.dest("dist"));
};

// Копирование шрифтов
export const fonts = () => {
    return gulp
        .src("src/fonts/**/*.{woff,woff2,ttf,eot,otf}")
        .pipe(gulp.dest("dist/fonts"));
};

// Сервер для разработки
export const serve = () => {
    bs.init({
        server: {
            baseDir: "dist",
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

// Билд
export const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, html, assets, fonts)
);

// Дефолтная задача — билд и запуск сервера
export default gulp.series(build, serve);
