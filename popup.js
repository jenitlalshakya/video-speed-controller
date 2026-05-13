document.addEventListener("DOMContentLoaded", () => {
    const DEFAULTS = {
        step: 0.25,
        fixedSpeed: 2.0,
        increaseKey: "]",
        decreaseKey: "[",
        enabled: true
    };
    const RESERVED_KEYS = ["j", "k", "l", "space"];
    const fields = Object.keys(DEFAULTS);

    function normalizeKey(key) {
        if (!key) return "";
        return key === " " ? "space" : key.toLowerCase();
    }

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
        let hasError = false;

        fields.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            if (id === "resetSpeed") return;

            let value = el.type === "checkbox" ? el.checked : el.value;

            if (id === "step") value = parseFloat(value);
            if (id === "fixedSpeed") value = parseFloat(value);

            if (id === "increaseKey" || id === "decreaseKey") {
                value = normalizeKey(value);

                if (RESERVED_KEYS.includes(value)) {
                    alert(`"${value}" is reserved for video controls (J, K, L, Space).`);
                    hasError = true;
                    return;
                }
            }

            newSettings[id] = value;
        });

        if (hasError) return;

        chrome.storage.sync.set(newSettings, () => {
            window.close();
        });
    };
});
