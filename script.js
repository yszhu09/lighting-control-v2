document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const colorPicker = document.getElementById('colorPicker');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const systemBrightnessContainer = document.getElementById('systemBrightnessContainer');
    const systemBrightnessSlider = document.getElementById('systemBrightnessSlider');
    const systemBrightnessValue = document.getElementById('systemBrightnessValue');
    const lightingBackground = document.getElementById('lightingBackground');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const presetColors = document.querySelectorAll('.preset-color');

    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Hide system brightness controls on desktop
    if (!isMobile) {
        systemBrightnessContainer.style.display = 'none';
    }

    // Update lighting function
    function updateLighting() {
        const color = colorPicker.value;
        const brightness = brightnessSlider.value;
        
        // Convert hex to RGB for brightness adjustment
        const r = parseInt(color.substr(1,2), 16);
        const g = parseInt(color.substr(3,2), 16);
        const b = parseInt(color.substr(5,2), 16);
        
        // Apply color brightness
        const factor = brightness / 100;
        const adjustedR = Math.round(r * factor);
        const adjustedG = Math.round(g * factor);
        const adjustedB = Math.round(b * factor);
        
        lightingBackground.style.backgroundColor = 
            `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
        
        brightnessValue.textContent = brightness;
    }

    // Update system brightness function (mobile only)
    async function updateSystemBrightness() {
        if (!isMobile) return;

        const brightness = systemBrightnessSlider.value / 100;
        systemBrightnessValue.textContent = Math.round(brightness * 100);

        try {
            // Try using the Screen Brightness API
            if ('screen' in window && 'brightness' in window.screen) {
                await window.screen.brightness.set(brightness);
            }
            // Alternative method for some browsers
            else if (window.screen && typeof window.screen.setBrightness === 'function') {
                await window.screen.setBrightness(brightness);
            }
            // Another alternative method
            else if (navigator.brightness && typeof navigator.brightness.setBrightness === 'function') {
                await navigator.brightness.setBrightness(brightness);
            }
        } catch (error) {
            console.error('Error setting brightness:', error);
        }
    }

    // Request permission for brightness control (mobile only)
    async function requestBrightnessPermission() {
        if (!isMobile) return;

        try {
            if ('permissions' in navigator) {
                await navigator.permissions.request({ name: 'screen-brightness' });
            }
        } catch (error) {
            console.error('Error requesting brightness permission:', error);
        }
    }

    // Mobile fullscreen handling
    function toggleFullscreen() {
        const elem = document.documentElement;
        
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            // Enter fullscreen
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { // iOS Safari
                elem.webkitRequestFullscreen();
            }
            fullscreenButton.textContent = '退出全屏';
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { // iOS Safari
                document.webkitExitFullscreen();
            }
            fullscreenButton.textContent = '进入全屏';
        }
    }

    // Keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        const step = 5;
        let newBrightness;

        // Shift + Arrow keys for system brightness (mobile only)
        if (e.shiftKey && isMobile) {
            newBrightness = parseInt(systemBrightnessSlider.value);
            if (e.key === 'ArrowUp') {
                newBrightness = Math.min(100, newBrightness + step);
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                newBrightness = Math.max(0, newBrightness - step);
                e.preventDefault();
            }
            if (newBrightness !== parseInt(systemBrightnessSlider.value)) {
                systemBrightnessSlider.value = newBrightness;
                updateSystemBrightness();
            }
        } 
        // Regular Arrow keys for color brightness
        else {
            newBrightness = parseInt(brightnessSlider.value);
            if (e.key === 'ArrowUp') {
                newBrightness = Math.min(100, newBrightness + step);
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                newBrightness = Math.max(0, newBrightness - step);
                e.preventDefault();
            }
            if (newBrightness !== parseInt(brightnessSlider.value)) {
                brightnessSlider.value = newBrightness;
                updateLighting();
            }
        }
    }

    // Event listeners
    colorPicker.addEventListener('input', updateLighting);
    brightnessSlider.addEventListener('input', updateLighting);
    if (isMobile) {
        systemBrightnessSlider.addEventListener('input', updateSystemBrightness);
    }
    fullscreenButton.addEventListener('click', toggleFullscreen);
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', () => {
        fullscreenButton.textContent = document.fullscreenElement ? '退出全屏' : '进入全屏';
    });
    document.addEventListener('webkitfullscreenchange', () => {
        fullscreenButton.textContent = document.webkitFullscreenElement ? '退出全屏' : '进入全屏';
    });

    // Preset color buttons
    presetColors.forEach(button => {
        button.addEventListener('click', () => {
            const presetColor = button.dataset.color;
            colorPicker.value = presetColor;
            updateLighting();
        });
    });

    // Initialize
    if (isMobile) {
        requestBrightnessPermission();
    }
    updateLighting();
});
