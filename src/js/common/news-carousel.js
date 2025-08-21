(function () {
    const news_carousels = document.querySelectorAll(".news__carousel");

    news_carousels.forEach((news_carousel) => {
        const news_track = news_carousel.querySelector(".news__track");
        const news_container = news_carousel.closest(".news");
        const news_btnLeft = news_container.querySelector(
            ".news__header-buttons button:first-child"
        );
        const news_btnRight = news_container.querySelector(
            ".news__header-buttons button:last-child"
        );

        let news_position = 0;
        let news_isDragging = false;
        let news_startX = 0;
        let news_downX = 0;
        let news_dragged = false;

        let news_lastX = 0;
        let news_lastTime = 0;
        let news_velocity = 0;
        let news_raf;

        function news_getItemWidth() {
            const item = news_track.querySelector(".news__item");
            const style = getComputedStyle(news_track);
            const gap = parseInt(style.columnGap || style.gap || 0);
            return item.offsetWidth + gap;
        }

        function news_getLimits() {
            const offset = news_container.getBoundingClientRect().left;
            const min = -offset;
            const max = news_track.scrollWidth - window.innerWidth + offset;
            return { min, max };
        }

        function news_updatePosition(animate = true) {
            news_track.style.transition = animate
                ? "transform 0.4s ease"
                : "none";
            news_track.style.transform = `translateX(${-news_position}px)`;
            news_updateButtons(); // обновляем состояние кнопок
        }

        function news_updateButtons() {
            const { min, max } = news_getLimits();

            // если все карточки помещаются
            if (news_track.scrollWidth <= window.innerWidth) {
                news_btnLeft.style.display = "none";
                news_btnRight.style.display = "none";
                return;
            } else {
                news_btnLeft.style.display = "";
                news_btnRight.style.display = "";
            }

            news_btnLeft.disabled = news_position <= min + 1;
            news_btnRight.disabled = news_position >= max - 1;
        }

        // --- Кнопки ---
        news_btnLeft.addEventListener("click", () => {
            const step = news_getItemWidth();
            const { min } = news_getLimits();
            news_position = Math.max(min, news_position - step);
            news_updatePosition(true);
        });

        news_btnRight.addEventListener("click", () => {
            const step = news_getItemWidth();
            const { max } = news_getLimits();
            news_position = Math.min(max, news_position + step);
            news_updatePosition(true);
        });

        // --- Drag / Swipe с резинкой ---
        function news_onDragMove(clientX) {
            const { min, max } = news_getLimits();
            news_track.style.transition = "none";

            let delta = news_startX - clientX;
            news_position = delta;

            const overscroll = 100; // резинка
            if (news_position < min) {
                news_position = min - Math.pow(min - news_position, 0.7);
            }
            if (news_position > max) {
                news_position = max + Math.pow(news_position - max, 0.7);
            }

            news_track.style.transform = `translateX(${-news_position}px)`;

            // скорость для инерции
            const now = Date.now();
            const deltaX = clientX - news_lastX;
            const deltaT = now - news_lastTime || 1;
            news_velocity = deltaX / deltaT;

            news_lastX = clientX;
            news_lastTime = now;
        }

        function news_onDragEnd() {
            if (!news_isDragging) return;
            news_isDragging = false;

            const { min, max } = news_getLimits();

            // корректировка по краям
            if (news_position < min) news_position = min;
            if (news_position > max) news_position = max;

            // инерция
            let momentum = news_velocity * 200;
            let target = news_position - momentum;
            target = Math.max(min, Math.min(max, target));

            cancelAnimationFrame(news_raf);
            const duration = 600;
            const start = news_position;
            const startTime = performance.now();

            function animate(time) {
                const progress = Math.min(1, (time - startTime) / duration);
                const ease = 1 - Math.pow(1 - progress, 3);
                news_position = start + (target - start) * ease;
                news_track.style.transform = `translateX(${-news_position}px)`;
                if (progress < 1) {
                    news_raf = requestAnimationFrame(animate);
                } else {
                    news_updateButtons();
                }
            }
            requestAnimationFrame(animate);
        }

        // Mouse
        news_carousel.addEventListener("mousedown", (e) => {
            news_isDragging = true;
            news_startX = e.pageX + news_position;
            news_downX = e.pageX;
            news_dragged = false;

            news_lastX = e.pageX;
            news_lastTime = Date.now();
            cancelAnimationFrame(news_raf);
        });

        news_carousel.addEventListener("mousemove", (e) => {
            if (!news_isDragging) return;
            if (Math.abs(e.pageX - news_downX) > 5) news_dragged = true;
            news_onDragMove(e.pageX);
        });

        news_carousel.addEventListener("mouseup", (e) => {
            if (news_dragged) e.preventDefault();
            news_onDragEnd();
        });

        news_carousel.addEventListener("mouseleave", news_onDragEnd);

        // Touch
        news_carousel.addEventListener("touchstart", (e) => {
            news_isDragging = true;
            news_startX = e.touches[0].pageX + news_position;
            news_downX = e.touches[0].pageX;
            news_dragged = false;

            news_lastX = e.touches[0].pageX;
            news_lastTime = Date.now();
            cancelAnimationFrame(news_raf);
        });

        news_carousel.addEventListener("touchmove", (e) => {
            if (!news_isDragging) return;
            if (Math.abs(e.touches[0].pageX - news_downX) > 5)
                news_dragged = true;
            news_onDragMove(e.touches[0].pageX);
        });

        news_carousel.addEventListener("touchend", (e) => {
            if (news_dragged) e.preventDefault();
            news_onDragEnd();
        });

        // --- Ссылки и картинки ---
        news_track.querySelectorAll("a, img").forEach((el) => {
            el.addEventListener("dragstart", (e) => e.preventDefault());
        });

        news_track.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", (e) => {
                if (news_dragged) e.preventDefault();
            });
        });

        // --- Инициализация ---
        const { min } = news_getLimits();
        news_position = min;
        news_updatePosition(false);

        window.addEventListener("resize", () => {
            const { min, max } = news_getLimits();
            news_position = Math.max(min, Math.min(max, news_position));
            news_updatePosition(false);
        });
    });
})();
