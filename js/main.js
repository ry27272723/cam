/**
 * Main Application Controller
 * Integrates webcam, gesture detection, and visual effect modes
 */

import { GestureDetector } from './gestureDetector.js';
import { NightSkyMode } from './modes/nightSky.js';
import { GardenMode } from './modes/garden.js';
import { MagicMode } from './modes/magic.js';

class HandGestureEffectsApp {
    constructor() {
        // DOM elements
        this.videoElement = document.getElementById('webcam');
        this.canvas = document.getElementById('effectsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.toggleBtn = document.getElementById('toggleBtn');
        this.gestureStatus = document.getElementById('gestureStatus');
        this.modeStatus = document.getElementById('modeStatus');
        this.loading = document.getElementById('loading');

        // State
        this.isRunning = false;
        this.currentMode = null;
        this.currentModeName = 'nightsky';
        this.gestureDetector = null;
        this.lastGesture = null;
        this.lastPosition = null;

        // Animation
        this.animationFrameId = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        // Set up event listeners
        this.setupEventListeners();

        // Initialize modes
        this.modes = {
            nightsky: new NightSkyMode(),
            garden: new GardenMode(this.canvas.height),
            magic: new MagicMode()
        };

        this.currentMode = this.modes[this.currentModeName];

        // Show initial mode status
        this.updateModeStatus();

        try {
            // Initialize webcam
            await this.initializeWebcam();

            // Initialize gesture detector
            this.gestureDetector = new GestureDetector(
                this.videoElement,
                (results) => this.handleGestureResults(results)
            );

            await this.gestureDetector.initialize();

            // Hide loading screen
            this.loading.classList.add('hidden');

            // Start animation loop (even when not detecting, for smooth rendering)
            this.startAnimationLoop();

        } catch (error) {
            console.error('Initialization error:', error);
            this.loading.querySelector('p').textContent =
                'Error: Could not access webcam. Please allow camera access and reload.';
        }
    }

    /**
     * Initialize webcam
     */
    async initializeWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            this.videoElement.srcObject = stream;

            // Wait for video to load
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });

            // Resize canvas to match video
            this.resizeCanvas();

        } catch (error) {
            throw new Error('Webcam access denied or unavailable');
        }
    }

    /**
     * Resize canvas to match video dimensions
     */
    resizeCanvas() {
        this.canvas.width = this.videoElement.videoWidth || 1280;
        this.canvas.height = this.videoElement.videoHeight || 720;

        // Update garden mode with new canvas height
        if (this.modes.garden) {
            this.modes.garden.setCanvasHeight(this.canvas.height);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toggle button
        this.toggleBtn.addEventListener('click', () => {
            this.toggleDetection();
        });

        // Mode selection buttons
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);

                // Update active button
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    /**
     * Toggle gesture detection
     */
    toggleDetection() {
        this.isRunning = !this.isRunning;

        if (this.isRunning) {
            this.toggleBtn.textContent = 'Stop';
            this.toggleBtn.classList.add('active');
        } else {
            this.toggleBtn.textContent = 'Start';
            this.toggleBtn.classList.remove('active');

            // Clear current effects when stopping
            this.currentMode.clear();
            this.lastGesture = null;
            this.lastPosition = null;
            this.updateGestureStatus(null);
        }
    }

    /**
     * Switch between modes
     */
    switchMode(modeName) {
        // Clear current mode effects
        if (this.currentMode) {
            this.currentMode.clear();
        }

        this.currentModeName = modeName;
        this.currentMode = this.modes[modeName];

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update status
        this.updateModeStatus();

        // Reset gesture state
        this.lastGesture = null;
        this.lastPosition = null;
    }

    /**
     * Handle gesture detection results
     */
    handleGestureResults(results) {
        if (!this.isRunning) return;

        const { gesture, position, fingerTip, gestureChanged, landmarks } = results;

        // Convert normalized coordinates to canvas coordinates
        let canvasPosition = null;
        let canvasFingerTip = null;

        if (position) {
            canvasPosition = {
                x: position.x * this.canvas.width,
                y: position.y * this.canvas.height
            };
        }

        if (fingerTip) {
            canvasFingerTip = {
                x: fingerTip.x * this.canvas.width,
                y: fingerTip.y * this.canvas.height
            };
        }

        // Update gesture status display
        this.updateGestureStatus(gesture);

        // Handle gesture state changes
        if (gestureChanged) {
            // Gesture ended
            if (this.lastGesture && !gesture) {
                this.currentMode.onGestureEnd(this.lastGesture, this.lastPosition);
            }
            // New gesture started
            else if (gesture && gesture !== this.lastGesture) {
                // End previous gesture if any
                if (this.lastGesture) {
                    this.currentMode.onGestureEnd(this.lastGesture, this.lastPosition);
                }

                // Start new gesture
                const position = gesture === 'one_finger' ? canvasFingerTip : canvasPosition;
                this.currentMode.onGestureStart(gesture, position);
            }
        }
        // Gesture continuing
        else if (gesture && canvasPosition) {
            const position = gesture === 'one_finger' ? canvasFingerTip : canvasPosition;
            this.currentMode.onGestureMove(gesture, position);
        }

        // Update last state
        this.lastGesture = gesture;
        this.lastPosition = gesture === 'one_finger' ? canvasFingerTip : canvasPosition;
    }

    /**
     * Update gesture status display
     */
    updateGestureStatus(gesture) {
        const gestureNames = {
            'open_palm': '✋ Open Palm',
            'closed_fist': '✊ Closed Fist',
            'one_finger': '☝️ One Finger'
        };

        this.gestureStatus.textContent = gesture
            ? gestureNames[gesture]
            : 'No gesture detected';
    }

    /**
     * Update mode status display
     */
    updateModeStatus() {
        const modeNames = {
            nightsky: '🌙 Night Sky Mode',
            garden: '🌸 Garden Mode',
            magic: '✨ Magic Mode'
        };

        this.modeStatus.textContent = modeNames[this.currentModeName];
    }

    /**
     * Start animation loop
     */
    startAnimationLoop() {
        const animate = () => {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw current mode effects
            if (this.currentMode) {
                this.currentMode.update(16); // ~60fps
                this.currentMode.draw(this.ctx);
            }

            // Continue loop
            this.animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Stop animation loop
     */
    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopAnimationLoop();

        if (this.gestureDetector) {
            this.gestureDetector.stop();
        }

        if (this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HandGestureEffectsApp();
});
