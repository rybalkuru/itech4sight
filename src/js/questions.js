document.querySelectorAll('.questions__item').forEach(item => {
    const info = item.querySelector('.questions__item-info');
    const img = item.querySelector('.questions__item-img');

    item.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;

        const isActive = item.classList.contains('active');

        if (isActive) {
            item.classList.remove('active');
            info.style.maxHeight = null;
            img.style.transform = 'rotate(0deg)';
        } else {
            item.classList.add('active');
            info.style.maxHeight = info.scrollHeight + 16 + 'px';
            img.style.transform = 'rotate(180deg)';
        }
    });
});
