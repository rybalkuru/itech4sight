"use strict";

const allFeatureBlocks = document.querySelectorAll('.features__block');
let lastScrollY = window.scrollY;

allFeatureBlocks.forEach((block) => {
    const desktopCards = block.querySelectorAll('.features__cards_desktop .features__card');
    const mobileCards = block.querySelectorAll('.features__cards_mobile .features__card');

    if (!desktopCards.length && !mobileCards.length) return;

    const mobileCardsContainer = block.querySelector('.features__cards_mobile');

    let currentCardIndex = 0;
    let scrollLocked = false;
    let allowScroll = false;

    const cardsLength = desktopCards.length || mobileCards.length;

    const activateCard = (indexOrElement) => {
        let index;
        if (typeof indexOrElement === 'number') {
            index = indexOrElement;
        } else {
            index = [...desktopCards].indexOf(indexOrElement);
            if (index === -1) {
                index = [...mobileCards].indexOf(indexOrElement);
            }
        }

        currentCardIndex = index;

        desktopCards.forEach((c, i) => {
            c.classList.toggle('features__card_active', i === index);
        });

        mobileCards.forEach((c, i) => {
            c.classList.toggle('features__card_active', i === index);
        });

        const activeId = desktopCards[index]?.dataset.id || mobileCards[index]?.dataset.id;

        block.querySelectorAll('.features__content-item').forEach(img => {
            img.classList.toggle('active', img.dataset.id === activeId);
        });

        if (mobileCardsContainer && mobileCards[index]) {
            mobileCards[index].scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    };

    if (mobileCardsContainer && mobileCards.length) {
        const lastCard = mobileCards[mobileCards.length - 1];

        const mobileScrollObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                allowScroll = true;
                block.classList.remove('features__block_active');
            }
        }, {
            root: mobileCardsContainer,
            threshold: 0.9,
        });

        mobileScrollObserver.observe(lastCard);
    }

    const scrollHandler = (e) => {
        if (allowScroll || scrollLocked) return;

        const blockRect = block.getBoundingClientRect();

        const scrollingDown = e.deltaY > 0;
        if (!scrollingDown && blockRect.top > window.innerHeight - 100) {
            allowScroll = true;
            window.removeEventListener('wheel', scrollHandler, { passive: false });
            return;
        }

        e.preventDefault();
        scrollLocked = true;

        let nextIndex = scrollingDown
            ? Math.min(cardsLength - 1, currentCardIndex + 1)
            : Math.max(0, currentCardIndex - 1);

        activateCard(nextIndex);

        const isLast = scrollingDown && nextIndex === cardsLength - 1;
        const isFirst = !scrollingDown && nextIndex === 0;

        if (isLast || isFirst) {
            allowScroll = true;
            window.removeEventListener('wheel', scrollHandler, { passive: false });

            setTimeout(() => {
                block.classList.remove('features__block_active');
            }, 300);
        }

        setTimeout(() => {
            scrollLocked = false;
        }, 400);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5;

            if (!isVisible) return;

            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY;
            lastScrollY = currentScrollY;

            block.classList.add('features__block_active');

            currentCardIndex = scrollingDown ? 0 : cardsLength - 1;
            activateCard(currentCardIndex);

            allowScroll = false;
            scrollLocked = false;

            window.removeEventListener('wheel', scrollHandler, { passive: false });
            window.addEventListener('wheel', scrollHandler, { passive: false });
        },
        { threshold: 0.5 }
    );

    observer.observe(block);
});
