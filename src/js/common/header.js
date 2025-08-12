document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("btn-dropdown-menu");
    const menu = document.getElementById("dropdown-menu");

    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.toggle("show");
        console.log("click");
    });

    document.addEventListener("click", function (e) {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove("show");
        }
    });
});
console.log("btn", document.getElementById("btn-dropdown-menu"));
console.log("menu", document.getElementById("dropdown-menu"));