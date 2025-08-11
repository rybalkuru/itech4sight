// ==============================
// 1. Мобильное меню
// ==============================
document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav");

    burger.addEventListener("click", function () {
        burger.classList.toggle("active");
        nav.classList.toggle("active");
    });
});

// ==============================
// 2. Плавная прокрутка к якорям
// ==============================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
            });
        }
    });
});

// ==============================
// 3. Анимация при скролле (IntersectionObserver)
// ==============================
const observerOptions = {
    threshold: 0.1,
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
});

// ==============================
// 4. Слайдер отзывов
// ==============================
(function () {
    const slider = document.querySelector(".feedback__slider");
    if (!slider) return;

    let currentIndex = 0;
    const slides = slider.querySelectorAll(".feedback__item");
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide) => slide.classList.remove("active"));
        slides[index].classList.add("active");
    }

    document.querySelector(".feedback__prev").addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    });

    document.querySelector(".feedback__next").addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    });

    showSlide(currentIndex);
})();

// ==============================
// 5. FAQ раскрытие вопросов
// ==============================
document.querySelectorAll(".questions__item").forEach((item) => {
    item.addEventListener("click", () => {
        item.classList.toggle("active");
    });
});

// ==============================
// 6. Форма обратной связи (валидация)
// ==============================
const form = document.querySelector(".feedback__form");
if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let valid = true;
        form.querySelectorAll("input[required], textarea[required]").forEach(
            (input) => {
                if (!input.value.trim()) {
                    input.classList.add("error");
                    valid = false;
                } else {
                    input.classList.remove("error");
                }
            }
        );

        if (valid) {
            // Здесь можно добавить отправку формы через fetch/AJAX
            alert("Форма успешно отправлена!");
            form.reset();
        }
    });
}
