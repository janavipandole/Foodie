// dark-mode.js
document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.createElement("button");
    toggleButton.id = "darkModeToggle";
    toggleButton.textContent = "Toggle Dark Mode";
    toggleButton.style.position = "fixed";
    toggleButton.style.bottom = "20px";
    toggleButton.style.right = "20px";
    toggleButton.style.padding = "10px 15px";
    toggleButton.style.zIndex = "1000";

    document.body.appendChild(toggleButton);

    toggleButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        const nav = document.querySelector(".navbar");
        if(nav) nav.classList.toggle("dark-mode");

        const footer = document.querySelector(".footer");
        if(footer) footer.classList.toggle("dark-mode");

        const cards = document.querySelectorAll(".card");
        cards.forEach(card => card.classList.toggle("dark-mode"));
    });
});
