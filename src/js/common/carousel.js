(function () {
    const partners_carousel = document.querySelector(".partners .carousel");
    const partners_track = partners_carousel.querySelector(".track");

    let partners_speed = 0.5; // px за кадр
    let partners_position = 0;

    // клонируем для бесконечной прокрутки
    partners_track.innerHTML += partners_track.innerHTML;

    const partners_items = partners_track.querySelectorAll(".partners__item");
    const partners_itemWidth = partners_items[0].offsetWidth + 16; // ширина + gap
    const partners_totalWidth = partners_itemWidth * partners_items.length;

    let partners_paused = false;
    let partners_isDragging = false;
    let partners_startX = 0;
    let partners_dragStartPos = 0;
    let partners_dragged = false;

    let partners_lastX = 0;
    let partners_lastTime = 0;
    let partners_velocity = 0;
    let partners_raf;

    function partners_animate() {
        if (!partners_paused && !partners_isDragging) {
            partners_position -= partners_speed;
            if (Math.abs(partners_position) >= partners_totalWidth / 2) {
                partners_position = 0;
            }
            partners_track.style.transform = `translateX(${partners_position}px)`;
        }
        requestAnimationFrame(partners_animate);
    }
    partners_animate();

    // hover → стоп
    partners_carousel.addEventListener(
        "mouseenter",
        () => (partners_paused = true)
    );
    partners_carousel.addEventListener(
        "mouseleave",
        () => (partners_paused = false)
    );

    // --- Drag/Swipe ---
    function partners_startDrag(e) {
        partners_isDragging = true;
        partners_dragged = false;
        partners_startX = e.pageX || e.touches[0].pageX;
        partners_dragStartPos = partners_position;

        partners_lastX = partners_startX;
        partners_lastTime = Date.now();

        cancelAnimationFrame(partners_raf);
    }

    function partners_onDrag(e) {
        if (!partners_isDragging) return;

        const x = e.pageX || e.touches[0].pageX;
        const dx = x - partners_startX;
        if (Math.abs(dx) > 3) partners_dragged = true;

        partners_position = partners_dragStartPos + dx;

        // бесконечность
        if (partners_position <= -partners_totalWidth / 2)
            partners_position += partners_totalWidth / 2;
        if (partners_position >= 0)
            partners_position -= partners_totalWidth / 2;

        partners_track.style.transform = `translateX(${partners_position}px)`;

        // для инерции
        const now = Date.now();
        const deltaX = x - partners_lastX;
        const deltaT = now - partners_lastTime || 1;
        partners_velocity = deltaX / deltaT;

        partners_lastX = x;
        partners_lastTime = now;
    }

    function partners_endDrag() {
        if (!partners_isDragging) return;
        partners_isDragging = false;

        if (!partners_dragged) return; // клик, ничего не делаем

        // инерция
        let target = partners_position + partners_velocity * 200; // коэффициент инерции

        // ограничение по бесконечной логике
        if (target <= -partners_totalWidth / 2)
            target += partners_totalWidth / 2;
        if (target >= 0) target -= partners_totalWidth / 2;

        const duration = 500;
        const start = partners_position;
        const startTime = performance.now();

        function animate(time) {
            const progress = Math.min(1, (time - startTime) / duration);
            const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            partners_position = start + (target - start) * ease;

            // бесконечность во время анимации
            if (partners_position <= -partners_totalWidth / 2)
                partners_position += partners_totalWidth / 2;
            if (partners_position >= 0)
                partners_position -= partners_totalWidth / 2;

            partners_track.style.transform = `translateX(${partners_position}px)`;
            if (progress < 1) {
                partners_raf = requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }

    // --- События ---
    partners_carousel.addEventListener("mousedown", partners_startDrag);
    partners_carousel.addEventListener("touchstart", partners_startDrag);

    window.addEventListener("mousemove", partners_onDrag);
    window.addEventListener("touchmove", partners_onDrag);

    window.addEventListener("mouseup", partners_endDrag);
    window.addEventListener("touchend", partners_endDrag);

    // --- Ссылки и картинки: блокируем drag у них и клики при перетаскивании ---
    partners_track.querySelectorAll("a, img").forEach((el) => {
        el.addEventListener("dragstart", (e) => e.preventDefault());
    });

    partners_track.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (e) => {
            if (partners_dragged) e.preventDefault();
        });
    });
})();
