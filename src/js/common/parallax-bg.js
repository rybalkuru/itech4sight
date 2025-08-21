function onScroll() {
    const scrollY = document.body.scrollTop;

    const layers = document.querySelectorAll(".layer");
    layers.forEach((layer) => {
        const speed = Number(layer.dataset.speed) || 0.2;
        layer.style.transform = `translate3d(0, -${scrollY * speed}px, 0)`;
    });
}

document.body.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();
