import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import gulpIf from "gulp-if";
import uglify from "gulp-uglify";
import browserSync from "browser-sync";
import del from "del";
import sourcemaps from "gulp-sourcemaps";
import replace from "gulp-replace";

import rollupStream from "@rollup/stream";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const sass = gulpSass(dartSass);
const bs = browserSync.create();
const isProd = process.env.NODE_ENV === "production";

const paths = {
    styles: {
        src: "scss/**/*.scss",
        dest: "dist/css",
    },
    scripts: {
        src: "js/**/*.js",
        entry: "js/main.js",
        dest: "dist/js",
    },
    html: {
        src: "**/*.html",
        dest: "dist",
    },
    images: {
        src: "images/**/*",
        dest: "dist/images",
    },
    videos: {
        src: "video/**/*",
        dest: "dist/video",
    },
    fonts: {
        src: "fonts/**/*",
        dest: "dist/fonts",
    },
};

// Очистка
export function clean() {
    return del(["dist"]);
}

// Стили с заменой путей на SITE_TEMPLATE_PATH
export function styles() {
    return gulp
        .src(paths.styles.src)
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass().on("error", sass.logError))
        .pipe(
            replace(
                /(\.\.\/)+(images|video|fonts)\//g,
                "<?=SITE_TEMPLATE_PATH?>/$2/"
            )
        )
        .pipe(gulpIf(isProd, cleanCSS()))
        .pipe(gulpIf(!isProd, sourcemaps.write(".")))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(bs.stream());
}

// JS с Rollup + замена путей
export function scripts() {
    return rollupStream({
        input: paths.scripts.entry,
        plugins: [nodeResolve(), commonjs()],
        output: { format: "iife", sourcemap: !isProd },
    })
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(
            replace(
                /(\.\.\/)+(images|video|fonts)\//g,
                "<?=SITE_TEMPLATE_PATH?>/$2/"
            )
        )
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(bs.stream());
}

// HTML
export function html() {
    return gulp
        .src(paths.html.src)
        .pipe(gulp.dest(paths.html.dest))
        .pipe(bs.stream());
}

// Картинки
export function images() {
    return gulp
        .src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest))
        .pipe(bs.stream());
}

// Видео
export function videos() {
    return gulp
        .src(paths.videos.src)
        .pipe(gulp.dest(paths.videos.dest))
        .pipe(bs.stream());
}

// Шрифты
export function fonts() {
    return gulp
        .src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest))
        .pipe(bs.stream());
}

// Сборка
export const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, html, images, videos, fonts)
);

// Сервер + Watch
export function serve() {
    bs.init({
        server: "./dist",
        notify: false,
    });

    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.html.src, html);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.videos.src, videos);
    gulp.watch(paths.fonts.src, fonts);
}

// Задачи
export const dev = gulp.series(build, serve);
export default build;
