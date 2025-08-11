import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import uglify from "gulp-uglify";
import concat from "gulp-concat";
import cleanCSS from "gulp-clean-css";
import del from "del";
import rename from "gulp-rename";
import replace from "gulp-replace";
import browserSync from "browser-sync";

const sass = gulpSass(dartSass);
const bs = browserSync.create();

// Очистка dist
export const clean = () => del(["dist"]);

// Компиляция SCSS → CSS (в src для dev)
export const styles = () => {
    return gulp
        .src("src/scss/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest("src/css")) // Кладём CSS в src/css для сервера
        .pipe(bs.stream()); // inject css без полной перезагрузки
};

// Минификация JS (в src для dev)
export const scripts = () => {
    return gulp
        .src("src/js/**/*.js")
        .pipe(concat("main.js"))
        .pipe(uglify())
        .pipe(gulp.dest("src/js"))
        .pipe(bs.stream());
};

// Обработка HTML — замена путей и переименование в php (для билд-процесса)
export const html = () => {
    return gulp
        .src("src/**/*.html")
        .pipe(replace(/dist\//g, "<?= SITE_TEMPLATE_PATH ?>/"))
        .pipe(rename({ extname: ".php" }))
        .pipe(gulp.dest("dist"));
};

// Копирование картинок и видео в dist (билд)
export const assets = () => {
    return gulp
        .src(["src/**/*.{jpg,jpeg,png,svg,gif,webp,mp4,webm}"])
        .pipe(gulp.dest("dist"));
};

// Копирование шрифтов в dist (билд)
export const fonts = () => {
    return gulp
        .src("src/fonts/**/*.{woff,woff2,ttf,eot,otf}")
        .pipe(gulp.dest("dist/fonts"));
};

// Перезагрузка браузера
const reload = (done) => {
    bs.reload();
    done();
};

// Локальный сервер для разработки
export const serve = () => {
    bs.init({
        server: {
            baseDir: "src", // Отдаём исходники для разработки
        },
        port: 3000,
        notify: false,
    });

    gulp.watch("src/scss/**/*.scss", styles);
    gulp.watch("src/js/**/*.js", gulp.series(scripts, reload));
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

// Полный билд с очисткой
export const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, html, assets, fonts)
);

// По умолчанию — запускаем дев-сервер
export default gulp.series(gulp.parallel(styles, scripts), serve);
