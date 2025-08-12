import gulp from "gulp";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import gulpIf from "gulp-if";
import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import replace from "gulp-replace";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import browserSyncModule from "browser-sync";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// CommonJS плагины через require
const sass = require("gulp-sass")(require("sass"));
const eslint = require("gulp-eslint");
const concat = require("gulp-concat");
const htmlmin = require("gulp-htmlmin");

const argv = yargs(hideBin(process.argv)).argv;
const isProd = argv.env === "production";

const browserSync = browserSyncModule.create();

const paths = {
    styles: {
        src: "src/scss/**/*.scss",
        dest: "dist/css",
    },
    scripts: {
        src: "src/js/**/*.js",
        dest: "dist/js",
    },
    images: {
        src: "src/images/**/*",
        dest: "dist/images",
    },
    fonts: {
        src: "src/fonts/**/*",
        dest: "dist/fonts",
    },
    html: {
        src: "src/**/*.html",
        dest: "dist/",
    },
};

export function styles() {
    return gulp
        .src(paths.styles.src)
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(gulpIf(isProd, cleanCSS({ level: 2 })))
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulp.dest(paths.styles.dest));
}

export function scripts() {
    return gulp
        .src(paths.scripts.src)
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulp.dest(paths.scripts.dest));
}

export function html() {
    return gulp
        .src(paths.html.src)
        .pipe(gulpIf(isProd, htmlmin({ collapseWhitespace: true })))
        .pipe(gulp.dest(paths.html.dest));
}

export function images() {
    return gulp.src(paths.images.src).pipe(gulp.dest(paths.images.dest));
}

export function fonts() {
    return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
}

export function replacePathsInCss() {
    return gulp
        .src(`${paths.styles.dest}/**/*.css`)
        .pipe(
            replace(
                /url\((['"]?)\.\.\/(images|video|fonts)\/(.*?)\1\)/g,
                (match, p1, folder, file) => {
                    return `url(${p1}<?=SITE_TEMPLATE_PATH?>/${folder}/${file}${p1})`;
                }
            )
        )
        .pipe(gulp.dest(paths.styles.dest));
}

export function replacePathsInJs() {
    return gulp
        .src(`${paths.scripts.dest}/**/*.js`)
        .pipe(
            replace(
                /(['"])\/(images|video|fonts)\/(.*?)\1/g,
                (match, quote, folder, file) => {
                    return `${quote}<?=SITE_TEMPLATE_PATH?>/${folder}/${file}${quote}`;
                }
            )
        )
        .pipe(gulp.dest(paths.scripts.dest));
}

export const replacePaths = gulp.parallel(replacePathsInCss, replacePathsInJs);

export function serve() {
    browserSync.init({
        server: "./dist",
    });

    gulp.watch(paths.styles.src, styles).on("change", browserSync.reload);
    gulp.watch(paths.scripts.src, scripts).on("change", browserSync.reload);
    gulp.watch(paths.html.src, html).on("change", browserSync.reload);
    gulp.watch(paths.images.src, images).on("change", browserSync.reload);
    gulp.watch(paths.fonts.src, fonts).on("change", browserSync.reload);
}

function replacePathsIfProd(done) {
    if (isProd) {
        return replacePaths();
    }
    done();
}

export const build = gulp.series(
    gulp.parallel(styles, scripts, html, images, fonts),
    replacePathsIfProd
);

export default build;
