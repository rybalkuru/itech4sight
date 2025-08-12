import gulp from "gulp";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import del from "del";
import rename from "gulp-rename";
import replace from "gulp-replace";
import browserSync from "browser-sync";

import rollup from "rollup";
import rollupStream from "@rollup/stream";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import terser from "gulp-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const sass = gulpSass(dartSass);
const bs = browserSync.create();

export const clean = () => del(["dist"]);

export const styles = () => {
    return gulp
        .src("src/scss/main.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest("dist/css"))
        .pipe(bs.stream());
};

export const scripts = () => {
    return rollupStream({
        input: "src/js/main.js",
        output: {
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
        .pipe(bs.stream());
};

export const html = () => {
    return gulp
        .src("src/**/*.html")
        .pipe(replace(/dist\//g, "<?= SITE_TEMPLATE_PATH ?>/"))
        .pipe(gulp.dest("dist"));
};

export const assets = () => {
    return gulp
        .src(["src/**/*.{jpg,jpeg,png,svg,gif,webp,mp4,webm}"])
        .pipe(gulp.dest("dist"));
};

export const fonts = () => {
    return gulp
        .src("src/fonts/**/*.{woff,woff2,ttf,eot,otf}")
        .pipe(gulp.dest("dist/fonts"));
};

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

export const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, html, assets, fonts)
);
export default gulp.series(build, serve);
