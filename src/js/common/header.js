// Главное меню
document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("btn-dropdown-menu");
    const menu = document.getElementById("dropdown-menu");

    if (btn && menu) {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            menu.classList.toggle("show");
        });

        document.addEventListener("click", function (e) {
            if (!btn.contains(e.target)) {
                menu.classList.remove("show");
            }
        });
    }
});

// Мобильное меню
// Мобильное меню
document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector(".nav_mobile .button-icon");
    const mobileMenu = document.querySelector(".nav_mobile-links");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function (e) {
            e.stopPropagation();
            const isOpening = !mobileMenu.classList.contains("active");
            
            mobileMenu.classList.toggle("active");
            document.body.classList.toggle("menu-open", isOpening);
            document.body.classList.toggle("menu-backdrop", isOpening);
        });

        // Закрытие меню при клике вне его области
        document.addEventListener("click", function (e) {
            if (
                !mobileMenu.contains(e.target) &&
                !menuButton.contains(e.target) &&
                mobileMenu.classList.contains("active")
            ) {
                mobileMenu.classList.remove("active");
                document.body.classList.remove("menu-open");
                document.body.classList.remove("menu-backdrop");
            }
        });

        // Закрытие меню при клике на ссылки
        document.querySelectorAll(".nav_mobile-link:not(.nav_mobile-links_submenu), .header__sublink-mobile").forEach(link => {
            link.addEventListener("click", function() {
                mobileMenu.classList.remove("active");
                document.body.classList.remove("menu-open");
                document.body.classList.remove("menu-backdrop");
            });
        });
    }

    // Обработчик для выпадающего меню "Продукты" в мобильной версии
    const productsButtons = document.querySelectorAll(".nav_mobile-links_submenu");
    if (productsButtons.length) {
        productsButtons.forEach(button => {
            button.addEventListener("click", function (e) {
                // Предотвращаем закрытие меню при клике на подменю
                e.stopPropagation();
                
                // Переключаем состояние только для текущего подменю
                const isOpening = !this.classList.contains("open");
                this.classList.toggle("open");
                
                // Закрываем другие открытые подменю
                productsButtons.forEach(otherButton => {
                    if (otherButton !== this && otherButton.classList.contains("open")) {
                        otherButton.classList.remove("open");
                    }
                });
            });
        });
    }
});
