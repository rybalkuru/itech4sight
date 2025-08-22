(function () {
    const carousel = document.querySelector(".partners .carousel-wrapper");
    const track = carousel.querySelector(".track");
    const gap = 16;

    const items = Array.from(track.querySelectorAll(".partner-card"));

    // клонируем элементы, чтобы track > 2 * экран
    function cloneItems() {
        let currentItems = [...items];
        while (getTrackWidth(currentItems) < window.innerWidth * 2) {
            const clones = items.map((el) => el.cloneNode(true));
            clones.forEach((clone) => track.appendChild(clone));
            currentItems = currentItems.concat(clones);
        }
        return currentItems;
    }

    function getTrackWidth(itemArray) {
        let width = 0;
        itemArray.forEach((el) => (width += el.offsetWidth));
        width += (itemArray.length - 1) * gap;
        return width;
    }

    let allItems = cloneItems();
    let totalWidth = getTrackWidth(allItems);
    const wrapWidth = totalWidth / 2; // wrap по половине клонированного блока

    let position = 0;
    const speed = 0.5;
    let raf;

    let paused = false;
    let isDragging = false;
    let startX = 0;
    let dragStartPos = 0;
    let dragged = false;

    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;

    function animate() {
        if (!paused && !isDragging) {
            position -= speed;
            if (position <= -wrapWidth) position += wrapWidth;
            if (position >= 0) position -= wrapWidth;
            track.style.transform = `translate3d(${position}px,0,0)`; // точное GPU-преобразование
        }
        raf = requestAnimationFrame(animate);
    }
    animate();

    carousel.addEventListener("mouseenter", () => (paused = true));
    carousel.addEventListener("mouseleave", () => (paused = false));

    // --- drag ---
    function startDrag(e) {
        isDragging = true;
        dragged = false;
        startX = e.pageX || e.touches[0].pageX;
        dragStartPos = position;
        lastX = startX;
        lastTime = performance.now();
        velocity = 0;
        cancelAnimationFrame(raf);
    }

    function onDrag(e) {
        if (!isDragging) return;
        const x = e.pageX || e.touches[0].pageX;
        const dx = x - startX;
        if (Math.abs(dx) > 3) dragged = true;

        position = dragStartPos + dx;

        // wrap-around
        if (position <= -wrapWidth) position += wrapWidth;
        if (position >= 0) position -= wrapWidth;

        track.style.transform = `translate3d(${position}px,0,0)`;

        // вычисляем мгновенную скорость для инерции
        const now = performance.now();
        const dt = now - lastTime || 1;
        velocity = (x - lastX) / dt;
        lastX = x;
        lastTime = now;
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        if (!dragged) {
            animate();
            return;
        }

        let momentum = velocity * 200; // небольшая инерция
        const friction = 0.92;

        function inertia() {
            momentum *= friction;
            //position += momentum;

            // wrap-around
            if (position <= -wrapWidth) position += wrapWidth;
            if (position >= 0) position -= wrapWidth;

            track.style.transform = `translate3d(${position}px,0,0)`;

            if (Math.abs(momentum) > 0.1) {
                raf = requestAnimationFrame(inertia);
            } else {
                animate();
            }
        }
        inertia();
    }

    // --- события ---
    carousel.addEventListener("mousedown", startDrag);
    carousel.addEventListener("touchstart", startDrag);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchmove", onDrag);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    track
        .querySelectorAll("a, img")
        .forEach((el) =>
            el.addEventListener("dragstart", (e) => e.preventDefault())
        );
    track.querySelectorAll("a").forEach((link) =>
        link.addEventListener("click", (e) => {
            if (dragged) e.preventDefault();
        })
    );

    // --- resize ---
    window.addEventListener("resize", () => {
        totalWidth = getTrackWidth(allItems);
        raf = requestAnimationFrame(animate);
    });
})();
