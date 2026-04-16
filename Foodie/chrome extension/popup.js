document.getElementById("openApp").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://hacktoberfest2025-foodie-rho.vercel.app/" });

});
