export function showPhase1() {
    const overlayText = document.querySelector("#overlayDim");
    const overlayClick = document.querySelector("#overlayClick");
    const msg = document.querySelector("#onboardingMessage");
    const target = document.querySelector("#toggle");

    target.style.zIndex = "1200";

    msg.innerHTML = `
        Explore peaks and toggle routes to view the trek
    `;

    overlayText.style.display = "flex";
    overlayClick.style.display = "flex";

    const advance = (e) => {
        e.preventDefault();
        e.stopPropagation();

        overlayClick.removeEventListener("click", advance);

        target.style.zIndex = "";
        overlayText.style.display = "none";
        overlayClick.style.display = "none";

        showPhase2();
    };

  overlayClick.addEventListener("click", advance);
}

function showPhase2() {
    const overlayText = document.querySelector("#overlayDim");
    const overlayClick = document.querySelector("#overlayClick");
    const msg = document.querySelector("#onboardingMessage");
    const target1 = document.querySelector("#map");
    const target2 = document.querySelector("#elevationChartContainer");

    target1.style.zIndex = "1200";
    target2.style.zIndex = "1200";

    msg.innerHTML = `
        The map shows the route. The chart below shows elevation over distance
    `;

    overlayText.style.display = "flex";
    overlayClick.style.display = "flex";

    const advance = (e) => {
        e.preventDefault();
        e.stopPropagation();

        overlayClick.removeEventListener("click", advance);

        target1.style.zIndex = "";
        target2.style.zIndex = "";
        overlayText.style.display = "none";
        overlayClick.style.display = "none";

    };

    overlayClick.addEventListener("click", advance);
}

export function showPhase3() {
    const overlayText = document.querySelector("#overlayDim");
    const overlayClick = document.querySelector("#overlayClick");
    const msg = document.querySelector("#onboardingMessage");
    const target1 = document.querySelector("#map");
    const target2 = document.querySelector("#elevationChartContainer");

    target1.style.zIndex = "1200";
    target2.style.zIndex = "1200";
    
    msg.innerHTML = `
        Hover to explore — the map and chart stay in sync.
    `;

    overlayText.style.display = "flex";
    overlayClick.style.display = "flex";

    const advance = (e) => {
        e.preventDefault();
        e.stopPropagation();

        overlayClick.removeEventListener("click", advance);

        target1.style.zIndex = "";
        target2.style.zIndex = "";
        overlayText.style.display = "none";
        overlayClick.style.display = "none";

    };

    overlayClick.addEventListener("click", advance);
}
