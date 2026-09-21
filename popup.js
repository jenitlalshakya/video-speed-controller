document.addEventListener("DOMContentLoaded", () => {
    const DEFAULTS = {
        step: 0.25,
        fixedSpeed: 2.0,
        increaseKey: "]",
        decreaseKey: "[",
        enabled: true
    };
    const RESERVED_KEYS = ["j", "k", "l", "t", "c", "f", "m", "i", "space", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    const SPEED_CONTROLLER = ["r", "g"];
    const fields = Object.keys(DEFAULTS);
    const saveButton = document.getElementById("save");

    function normalizeKey(key) {
        if (!key) return "";
        return key === " " ? "space" : key.toLowerCase();
    }

    function validateKey(id) {
        const input = document.getElementById(id);
        const error = document.getElementById(`${id}Error`);

        if (!input || !error) return false;

        const value = normalizeKey(input.value);

        if (!value) {
            error.textContent = "";
            input.classList.remove("invalid");
            return false;
        }

        if (RESERVED_KEYS.includes(value) || /^[0-9]$/.test(value)) {
            error.textContent = `"${value}" is reserved for video controls (J, K, L, T, C, F, M, I, Space, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 0-9).`;
            input.classList.add("invalid");
            return true;
        } else if (SPEED_CONTROLLER.includes(value)) {
            error.textContent = `"${value}" is a fixed key for speed controller (R, G).`;
            input.classList.add("invalid");
            return true;
        }

        error.textContent = "";
        input.classList.remove("invalid");
        return false;
    }

    function validateForm() {
        const increaseError = validateKey("increaseKey");
        const decreaseError = validateKey("decreaseKey");
        const hasError = increaseError || decreaseError;

        saveButton.disabled = hasError;

        return !hasError;
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

        validateForm();
    });

    const increaseKey = document.getElementById("increaseKey");
    const decreaseKey = document.getElementById("decreaseKey");

    if (increaseKey) {
        increaseKey.addEventListener("input", validateForm);
    }

    if (decreaseKey) {
        decreaseKey.addEventListener("input", validateForm);
    }

    // Save settings
    saveButton.onclick = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        
        const newSettings = {};

        fields.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            if (id === "resetSpeed") return;

            let value = el.type === "checkbox" ? el.checked : el.value;

            if (id === "step") value = parseFloat(value);
            if (id === "fixedSpeed") value = parseFloat(value);

            if (id === "increaseKey" || id === "decreaseKey") {
                value = normalizeKey(value);
            }

            newSettings[id] = value;
        });

        chrome.storage.sync.set(newSettings, () => {
            window.close();
        });
    };
});
