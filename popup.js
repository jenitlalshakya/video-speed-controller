document.addEventListener("DOMContentLoaded", () => {
    const DEFAULTS = {
        step: 0.25,
        fixedSpeed: 3.0,
        increaseKey: "]",
        decreaseKey: "[",
        enabled: false
    };

    const fields = Object.keys(DEFAULTS);

    // Load settings with defaults
    chrome.storage.sync.get(fields, data => {
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const value = data[id] !== undefined ? data[id] : DEFAULTS[id];

            if (el.type === "checkbox") {
                el.checked = Boolean(value);
            } else {
                el.value = value;
            }
        });
    });

    // Save settings
    document.getElementById("save").onclick = (e) => {
        e.preventDefault();
        
        const newSettings = {};
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            if (id === "resetSpeed") return;

            newSettings[id] = el.type === "checkbox" ? el.checked : el.value;
        });

        if (newSettings.step !== undefined) newSettings.step = parseFloat(newSettings.step);
        if (newSettings.fixedSpeed !== undefined) newSettings.fixedSpeed = parseFloat(newSettings.fixedSpeed);

        chrome.storage.sync.set(newSettings, () => {
            window.close();
        });
    };
});
