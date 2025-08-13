//Главное меню
document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("btn-dropdown-menu");
    const menu = document.getElementById("dropdown-menu");

    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.toggle("show");
        console.log("click");
    });

    document.addEventListener("click", function (e) {
        if (!btn.contains(e.target)) {
            menu.classList.remove("show");
        }
    });
});
//Мобильное меню
document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector(".nav_mobile .button-icon");
    const mobileMenu = document.querySelector(".nav_mobile-links");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function (e) {
            e.stopPropagation();
            mobileMenu.classList.toggle("active");
        });

        // Закрытие меню при клике вне его области
        document.addEventListener("click", function (e) {
            if (
                !mobileMenu.contains(e.target) &&
                !menuButton.contains(e.target)
            ) {
                mobileMenu.classList.remove("active");
            }
        });
    }

    // Обработчик для выпадающего меню "Продукты" в мобильной версии
    const productsButton = document.querySelector(".nav_mobile-links_submenu");
    if (productsButton) {
        productsButton.addEventListener("click", function () {
            this.classList.toggle("open");
        });
    }
});
