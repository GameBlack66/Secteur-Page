// 🔒 Bloquer certains raccourcis clavier
document.addEventListener("keydown", function(e) {
    // Ctrl + U
    if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
    }

    // F12
    if (e.key === "F12") {
        e.preventDefault();
    }

    // Ctrl + Shift + I / J / C
    if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
});

// 🖱️ Désactiver clic droit
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

// 🚨 Détection simple des DevTools ouverts (optionnel)
setInterval(function() {
    const threshold = 160;
    if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
    ) {
        console.clear();
        console.log("DevTools détecté 👀");
    }
}, 1000);