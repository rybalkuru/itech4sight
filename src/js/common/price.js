document.querySelectorAll('.range-input').forEach((rangeInput) => {
    const rangeContainer = rangeInput.closest('.range');
    const marks = rangeContainer.querySelectorAll('.range-mark');

    function updateMarks(value) {
        marks.forEach((mark, i) => {
            mark.style.visibility = (i == value) ? 'hidden' : 'visible';
        });
    }

    rangeInput.addEventListener('input', (e) => {
        updateMarks(+e.target.value);
    });

    updateMarks(+rangeInput.value);
});

document.querySelectorAll('.calculator__period-switcher').forEach((switcher) => {
    const left = switcher.querySelector('.switcher__left');
    const right = switcher.querySelector('.switcher__right');

    left.addEventListener('click', () => {
        left.classList.add('switcher__active');
        right.classList.remove('switcher__active');
    });

    right.addEventListener('click', () => {
        right.classList.add('switcher__active');
        left.classList.remove('switcher__active');
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const userRange = document.getElementById("calculator__users-range");
    const userInput = document.querySelector(".calculator__users-count");
    const regionRange = document.getElementById("calculator__region-range");
    const regionInput = document.querySelector(".calculator__region-count");
    const resetButton = document.querySelector(".calculator__reset");

    const userValues = [10, 20, 30, 40, 50, 100];
    const regionValues = [1, 2, 3, 4, 5, 10];

    const basePrices = {
        base: 15000,
        standard: 25000,
        profi: 35000
    };

    const costTitles = {
        base: document.querySelector(".costs__base .costs__title + .costs__main-info + h5"),
        standard: document.querySelector(".costs__standart .costs__title + .costs__main-info + h5"),
        profi: document.querySelector(".costs__profi .costs__title + .costs__main-info + h5")
    };

    const userCards = document.querySelectorAll(".costs__block .costs__main-info .costs__item:nth-child(1) .costs__item-value");
    const regionCards = document.querySelectorAll(".costs__block .costs__main-info .costs__item:nth-child(2) .costs__item-value");

    const defaultUsers = userValues[0];
    const defaultRegions = regionValues[0];
    let isYearly = false;

    function updateMarks(rangeInput) {
        const rangeContainer = rangeInput.closest('.range');
        const marks = rangeContainer.querySelectorAll('.range-mark');
        marks.forEach((mark, i) => {
            mark.style.visibility = (i == +rangeInput.value) ? 'hidden' : 'visible';
        });
    }

    function updateCards(nodeList, value) {
        nodeList.forEach(el => el.textContent = value);
    }

    function updatePrices() {
        const users = parseInt(userInput.value, 10);
        const regions = parseInt(regionInput.value, 10);

        Object.keys(basePrices).forEach(plan => {
            let price = basePrices[plan];

            if (users > 10) {
                price += Math.floor((users - 10) / 10) * 1000;
            }

            if (regions > 1) {
                price += (regions - 1) * 1000;
            }

            if (isYearly) {
                price = price * 12 * 0.7;
                costTitles[plan].textContent = `${price.toLocaleString("ru-RU")} ₽/год`;
            } else {
                costTitles[plan].textContent = `${price.toLocaleString("ru-RU")} ₽/месяц`;
            }
        });
    }

    function updateResetState() {
        resetButton.disabled =
            +userInput.value === defaultUsers &&
            +regionInput.value === defaultRegions &&
            !isYearly;
    }

    function syncSlider(input, slider, valuesArray) {
        const value = parseInt(input.value, 10);
        let index = valuesArray.indexOf(value);

        if (index === -1) {
            if (value < valuesArray[0]) {
                index = 0;
            } else if (value > valuesArray[valuesArray.length - 1]) {
                index = valuesArray.length - 1;
            } else {
                index = valuesArray.findIndex(v => v >= value);
            }
        }

        slider.value = index;
        updateMarks(slider);
    }

    function handleSlider(slider, input, valuesArray, cardNodes) {
        slider.addEventListener("input", () => {
            const index = parseInt(slider.value, 10);
            const value = valuesArray[index];
            input.value = value;
            updateCards(cardNodes, value);
            updateMarks(slider);
            updatePrices();
            updateResetState();
        });
    }

    function handleInput(input, slider, valuesArray, cardNodes) {
        input.addEventListener("input", () => {
            const value = parseInt(input.value, 10);
            if (!isNaN(value)) {
                updateCards(cardNodes, value);
                syncSlider(input, slider, valuesArray);
                updatePrices();
                updateResetState();
            }
        });
    }

    function handleReset() {
        resetButton.addEventListener("click", () => {
            userRange.value = 0;
            regionRange.value = 0;
            userInput.value = defaultUsers;
            regionInput.value = defaultRegions;
            isYearly = false;
            document.querySelector(".switcher__left").classList.add("switcher__active");
            document.querySelector(".switcher__right").classList.remove("switcher__active");
            updateCards(userCards, defaultUsers);
            updateCards(regionCards, defaultRegions);
            updateMarks(userRange);
            updateMarks(regionRange);
            updatePrices();
            resetButton.disabled = true;
        });
    }

    document.querySelectorAll('.calculator__period-switcher').forEach((switcher) => {
        const left = switcher.querySelector('.switcher__left');
        const right = switcher.querySelector('.switcher__right');

        left.addEventListener('click', () => {
            left.classList.add('switcher__active');
            right.classList.remove('switcher__active');
            isYearly = false;
            updatePrices();
            updateResetState();
        });

        right.addEventListener('click', () => {
            right.classList.add('switcher__active');
            left.classList.remove('switcher__active');
            isYearly = true;
            updatePrices();
            updateResetState();
        });
    });

    function enforceLimits(input, min, max, slider, valuesArray) {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/\D/g, "");

            if (input.value === "") {
                input.value = min;
            }

            let value = parseInt(input.value, 10);
            if (value < min) value = min;
            if (value > max) value = max;

            input.value = value;
            syncSlider(input, slider, valuesArray);
        });
    }


    enforceLimits(userInput, 1, 1000, userRange, userValues);
    enforceLimits(regionInput, 1, 100, regionRange, regionValues);
    updateMarks(userRange);
    updateMarks(regionRange);
    updateCards(userCards, defaultUsers);
    updateCards(regionCards, defaultRegions);
    updatePrices();

    handleSlider(userRange, userInput, userValues, userCards);
    handleSlider(regionRange, regionInput, regionValues, regionCards);
    handleInput(userInput, userRange, userValues, userCards);
    handleInput(regionInput, regionRange, regionValues, regionCards);
    handleReset();
});



