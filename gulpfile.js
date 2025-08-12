const gulp = require("gulp");
const newer = require("gulp-newer");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify-es").default;
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const del = require("del");
const replace = require("gulp-replace");

// Путь для замены
const SITE_TEMPLATE_PATH = "SITE_TEMPLATE_PATH";

const paths = {
    src: {
        root: "src",
        scss: "src/scss/**/*.scss",
        js: "src/js/**/*.js",
        images: "src/images/**/*",
        fonts: "src/fonts/**/*",
        videos: "src/videos/**/*",
        html: "src/**/*.html",
    },
    dist: {
        root: "dist",
        css: "dist/css",
        js: "dist/js",
        images: "dist/images",
        fonts: "dist/fonts",
        videos: "dist/videos",
    },
};

function clean() {
    return del(paths.dist.root);
}

function styles() {
    return gulp
        .src(paths.src.scss, { sourcemaps: true })
        .pipe(plumber())
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest(paths.dist.css, { sourcemaps: "." }));
}

function scripts() {
    return gulp
        .src(paths.src.js, { sourcemaps: true })
        .pipe(plumber())
        .pipe(concat("main.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.js, { sourcemaps: "." }));
}

function images() {
    return gulp
        .src(paths.src.images)
        .pipe(newer(paths.dist.images))
        .pipe(gulp.dest(paths.dist.images));
}

function fonts() {
    return gulp
        .src(paths.src.fonts)
        .pipe(newer(paths.dist.fonts))
        .pipe(gulp.dest(paths.dist.fonts));
}

function videos() {
    return gulp
        .src(paths.src.videos)
        .pipe(newer(paths.dist.videos))
        .pipe(gulp.dest(paths.dist.videos));
}

function html() {
    return gulp.src(paths.src.html).pipe(gulp.dest(paths.dist.root));
}

// Задача замены путей в CSS
function replaceCssPaths() {
    return gulp
        .src(paths.dist.css + "/**/*.css")
        .pipe(
            replace(
                /url\((['"]?)(?!https?:|\/\/|data:)([^'")]+)\1\)/g,
                (match, quote, url) => {
                    return `url(${quote}${SITE_TEMPLATE_PATH}/${url}${quote})`;
                }
            )
        )
        .pipe(gulp.dest(paths.dist.css));
}

// Задача замены путей в JS
function replaceJsPaths() {
    return gulp
        .src(paths.dist.js + "/**/*.js")
        .pipe(
            replace(
                /(['"])(\/?(images|fonts|videos|css|js)[^'"]*)\1/g,
                (match, quote, url) => {
                    return `${quote}${SITE_TEMPLATE_PATH}/${url.replace(
                        /^\/?/,
                        ""
                    )}${quote}`;
                }
            )
        )
        .pipe(gulp.dest(paths.dist.js));
}

// Объединённая задача замены путей
const replacePaths = gulp.parallel(replaceCssPaths, replaceJsPaths);

// Основная сборка
const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, images, fonts, videos, html),
    replacePaths
);

// Экспорт задач
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.videos = videos;
exports.html = html;
exports.replacePaths = replacePaths;
exports.build = build;
exports.default = build;
