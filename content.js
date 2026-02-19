// DEFAULT SETTINGS
const DEFAULT_SETTINGS = {
    step: 0.25,
    fixedSpeed: 3.0,
    increaseKey: "]",
    decreaseKey: "[",
    enabled: false
};

let settings = { ...DEFAULT_SETTINGS };
let currentSpeed = 1.0;

// LOAD SETTINGS SAFELY
chrome.storage.sync.get(DEFAULT_SETTINGS, data => {
    settings = { ...DEFAULT_SETTINGS, ...data };
    if (!settings.enabled) return;
    getVideos().forEach(video => {
        attachMouseListeners(video);
        
        if (settings.enabled) {
            video.playbackRate = currentSpeed;
        }
    });
});

// LISTEN FOR TOGGLE CHANGES
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;

    for (const key in changes) {
        settings[key] = changes[key].newValue;
    }

    if (!settings.enabled) {
        getVideos().forEach(v => v.playbackRate = 1);
        currentSpeed = 1;
    } else {
        getVideos().forEach(v => v.playbackRate = currentSpeed);
    }
});

// VIDEO HANDLING
function getVideos() {
    return Array.from(document.querySelectorAll("video"));
}

function applySpeed(speed) {
    speed = Math.max(0.1, speed);
    currentSpeed = speed;

    getVideos().forEach(video => {
        video.playbackRate = speed;
    });

    showOverlay(speed);
}

// FULLSCREEN DETECTION
function getFullscreenElement() {
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
}

// GET BEST CONTAINER FOR OVERLAY
function getVideoContainer(video) {
    return (
        getFullscreenElement() ||
        video.closest('.html5-video-player') || // YouTube
        video.parentElement ||
        document.documentElement
    );
}

// OVERLAY UI
let overlay;

function showOverlay(speed) {
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'vsc-overlay';

        Object.assign(overlay.style, {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '2147483647',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.2s ease'
        });
    }

    overlay.textContent = `Speed: ${speed.toFixed(2)}x`;

    const video = getVideos()[0];
    if (!video) return;

    const container = getVideoContainer(video);

    // 🔥 CRITICAL FIX: force re-attach every time
    overlay.remove();
    container.appendChild(overlay);

    overlay.style.opacity = '1';

    clearTimeout(overlay.hideTimeout);
    overlay.hideTimeout = setTimeout(() => {
        overlay.style.opacity = '0';
    }, 800);
}

let mouseMoveTimeout = null;

// ATTACH OVERLAY ON MOUSE MOVE
function attachMouseListeners(video) {
    const container = getVideoContainer(video);
    if (!container || container.__vscMouseAttached) return;

    container.__vscMouseAttached = true;

    container.addEventListener('mousemove', () => {
        if (!settings.enabled) return;

        showOverlay(currentSpeed);

        clearTimeout(mouseMoveTimeout);
        mouseMoveTimeout = setTimeout(() => {
            if (overlay) {
                overlay.style.opacity = '0';
            }
        }, 1000);
    });

    // LISTEN WHEN MOUSE LEAVE THE VIDEO CONTAINER AND DIABLE OVERLAY VIEW
    container.addEventListener('mouseleave', () => {
        if (overlay) {
            overlay.style.opacity = '0';
        }
    });
}

// REATTACH ON FULLSCREEN CHANGES
["fullscreenchange", "webkitfullscreenchange"].forEach(evt => {
    document.addEventListener(evt, () => {
        if (settings.enabled) {
            showOverlay(currentSpeed);
        }
    });
});

// KEYBOARD CONTROLS
document.addEventListener("keydown", e => {
    if (!settings.enabled) return;
    if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

    const key = e.key.toLowerCase();

    if (key === settings.increaseKey.toLowerCase()) {
        applySpeed(currentSpeed + settings.step);
    }

    if (key === settings.decreaseKey.toLowerCase()) {
        applySpeed(currentSpeed - settings.step);
    }

    if (key === "r") {
        applySpeed(1.0);
    }

    if (key === "g") {
        applySpeed(settings.fixedSpeed);
    }
});

// DYNAMIC VIDEO SUPPORT
const observer = new MutationObserver(() => {
    getVideos().forEach(video => {
        if (video.playbackRate !== currentSpeed) {
            video.playbackRate = currentSpeed;
        }
        attachMouseListeners(video);
    });
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// SAFETY REAPPLY
setInterval(() => {
    getVideos().forEach(video => {
        if (video.playbackRate !== currentSpeed) {
            video.playbackRate = currentSpeed;
        }
    });
}, 1000);
