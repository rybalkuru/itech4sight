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
import groupMedia from "gulp-group-css-media-queries";

import rollupStream from "@rollup/stream";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import sharp from "gulp-sharp-responsive";
import rename from "gulp-rename";

const sass = gulpSass(dartSass);
const bs = browserSync.create();
const isProd = process.env.NODE_ENV === "production";

const paths = {
    styles: {
        src: "src/scss/**/*.scss",
        dest: "dist/css",
    },
    scripts: {
        src: "src/js/**/*.js",
        entry: "src/js/main.js",
        dest: "dist/js",
    },
    html: {
        src: "src/**/*.html",
        dest: "dist",
    },
    images: {
        src: "src/images/**/*.{jpg,jpeg,png,svg,gif}",
        dest: "dist/images",
    },
    videos: {
        src: "src/video/**/*",
        dest: "dist/video",
    },
    fonts: {
        src: "src/fonts/**/*",
        dest: "dist/fonts",
    },
};

// Очистка
export function clean() {
    return del(["dist"]);
}

// Картинки
export function images() {
    if (!isProd) {
        // Dev: копируем без изменений
        return gulp
            .src(paths.images.src)
            .pipe(gulp.dest(paths.images.dest))
            .pipe(bs.stream());
    }

    // Prod: конвертация только jpg/png → webp
    return gulp
        .src("src/images/**/*.{jpg,jpeg,png}")
        .pipe(
            sharp({
                formats: [{ format: "webp", webp: { quality: 80 } }],
            })
        )
        .pipe(
            rename((path) => {
                // сохраняем оригинальные имена
                path.basename = path.basename.replace(/-optimized$/, "");
            })
        )
        .pipe(gulp.dest(paths.images.dest))
        .pipe(bs.stream());
}

// Стили
export function styles() {
    return gulp
        .src(paths.styles.src)
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass().on("error", sass.logError))
        .pipe(gulpIf(isProd, groupMedia()))
        .pipe(gulpIf(isProd, cleanCSS()))
        .pipe(
            gulpIf(
                isProd,
                replace(/url\(['"]?(\.\.\/)+([^'")]+)['"]?\)/g, (match) => {
                    // всегда делаем на уровень выше (../../ → ../)
                    let fixed = match.replace(/(\.\.\/)+/, "../");
                    // заменяем jpg|jpeg|png → webp
                    fixed = fixed.replace(
                        /\.(jpg|jpeg|png)(['")])/g,
                        ".webp$2"
                    );
                    return fixed;
                })
            )
        )
        .pipe(gulpIf(!isProd, sourcemaps.write(".")))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(bs.stream());
}

// Скрипты
export function scripts() {
    return rollupStream({
        input: paths.scripts.entry,
        plugins: [nodeResolve(), commonjs()],
        output: { format: "iife", sourcemap: !isProd },
    })
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(bs.stream());
}

// HTML
export function html() {
    return gulp
        .src(paths.html.src)
        .pipe(
            gulpIf(
                isProd,
                replace(
                    /(src|href)="(\.\.\/)*(images\/[^"']+)\.(jpg|jpeg|png)"/g,
                    (match, attr, prefix, filename) =>
                        `${attr}="<?= SITE_TEMPLATE_PATH ?>/${filename}.webp"`
                )
            )
        )
        .pipe(
            gulpIf(
                isProd,
                replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
                    if (url.includes("../images/")) {
                        let cleanUrl = url.replace("../", "");
                        cleanUrl = cleanUrl.replace(
                            /\.(jpg|jpeg|png)$/,
                            ".webp"
                        );
                        return `url("<?= SITE_TEMPLATE_PATH ?>/${cleanUrl}")`;
                    }
                    return match;
                })
            )
        )
        .pipe(gulp.dest(paths.html.dest))
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
    gulp.parallel(images, fonts, videos),
    gulp.parallel(styles, scripts),
    html
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
