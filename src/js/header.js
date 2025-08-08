"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const productsWrapper = document.querySelector(".header__products-wrapper");
    const productsMenu = productsWrapper.querySelector(".header__products");
    const productsBlock = document.querySelector(".header__mobile-link_products");
    const productsBtn = document.querySelector(".header__mobile-link_products-top");

    const menuBtn = document.querySelector(".header__menu");
    const mobileNav = document.querySelector(".header__mobile-nav");

    const languageSwitcher = document.querySelector(".header__language-switcher");

    productsWrapper.addEventListener("click", (e) => {
        e.stopPropagation();
        productsMenu.classList.toggle("header__products_open");
    });

    productsBtn.addEventListener("click", () => {
        productsBlock.classList.toggle("header__mobile-link_products-open");
    });

    document.addEventListener("click", () => {
        productsMenu.classList.remove("header__products_open");
    });

    menuBtn.addEventListener("click", () => {
        mobileNav.classList.toggle("header__mobile-nav_open");
    });

    languageSwitcher.addEventListener("click", () => {
        if (languageSwitcher.textContent.trim() === "En") {
            languageSwitcher.textContent = "Ru";
        } else {
            languageSwitcher.textContent = "En";
        }
    });
});
