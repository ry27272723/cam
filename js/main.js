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
        this.selectionScreen = document.getElementById('selectionScreen');
        this.cameraScreen = document.getElementById('cameraScreen');
        this.loading = document.getElementById('loading');
        this.videoElement = document.getElementById('webcam');
        this.canvas = document.getElementById('effectsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gestureStatus = document.getElementById('gestureStatus');
        this.modeStatus = document.getElementById('modeStatus');
        this.backBtn = document.getElementById('backBtn');

        // State
        this.isInitialized = false;
        this.isRunning = false;
        this.currentMode = null;
        this.currentModeName = null;
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
    init() {
        // Set up event listeners for mode selection
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                this.startMode(mode);
            });
        });

        // Back button
        this.backBtn.addEventListener('click', () => {
            this.returnToSelection();
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (this.isInitialized) {
                this.resizeCanvas();
            }
        });
    }

    /**
     * Start a mode - initialize camera and gesture detection
     */
    async startMode(modeName) {
        this.currentModeName = modeName;

        // Show loading
        this.selectionScreen.classList.add('hidden');
        this.loading.classList.remove('hidden');

        try {
            // Initialize if first time
            if (!this.isInitialized) {
                await this.initializeSystem();
            }

            // Initialize modes (with current canvas height)
            this.modes = {
                nightsky: new NightSkyMode(),
                garden: new GardenMode(this.canvas.height),
                magic: new MagicMode()
            };

            // Set current mode
            this.currentMode = this.modes[modeName];
            this.updateModeStatus();

            // Show camera screen
            this.loading.classList.add('hidden');
            this.cameraScreen.classList.remove('hidden');

            // Start gesture detection
            this.isRunning = true;

            console.log('Mode started:', modeName);

        } catch (error) {
            console.error('Initialization error:', error);
            this.loading.querySelector('p').textContent =
                'Error: Could not access camera. Please allow camera access and reload.';
        }
    }

    /**
     * Initialize camera and gesture detection system
     */
    async initializeSystem() {
        console.log('Initializing system...');

        // Initialize webcam
        await this.initializeWebcam();
        console.log('Webcam initialized');

        // Initialize gesture detector
        this.gestureDetector = new GestureDetector(
            this.videoElement,
            (results) => this.handleGestureResults(results)
        );

        await this.gestureDetector.initialize();
        console.log('Gesture detector initialized');

        // Start animation loop
        this.startAnimationLoop();
        console.log('Animation loop started');

        this.isInitialized = true;
    }

    /**
     * Initialize webcam
     */
    async initializeWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;

            // Wait for video to load
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });

            // Small delay to ensure video is playing
            await new Promise(resolve => setTimeout(resolve, 500));

            // Resize canvas to match video
            this.resizeCanvas();

        } catch (error) {
            console.error('Webcam error:', error);
            throw new Error('Webcam access denied or unavailable');
        }
    }

    /**
     * Resize canvas to match video dimensions
     */
    resizeCanvas() {
        const videoWidth = this.videoElement.videoWidth || 1280;
        const videoHeight = this.videoElement.videoHeight || 720;

        this.canvas.width = videoWidth;
        this.canvas.height = videoHeight;

        console.log('Canvas resized to:', videoWidth, 'x', videoHeight);

        // Update garden mode with new canvas height
        if (this.modes && this.modes.garden) {
            this.modes.garden.setCanvasHeight(this.canvas.height);
        }
    }

    /**
     * Return to mode selection screen
     */
    returnToSelection() {
        // Stop detection
        this.isRunning = false;

        // Clear effects
        if (this.currentMode) {
            this.currentMode.clear();
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Reset gesture state
        this.lastGesture = null;
        this.lastPosition = null;
        this.updateGestureStatus(null);

        // Show selection screen
        this.cameraScreen.classList.add('hidden');
        this.selectionScreen.classList.remove('hidden');
    }

    /**
     * Handle gesture detection results
     */
    handleGestureResults(results) {
        if (!this.isRunning || !this.currentMode) {
            return;
        }

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
                console.log('Gesture ended:', this.lastGesture);
                this.currentMode.onGestureEnd(this.lastGesture, this.lastPosition);
            }
            // New gesture started
            else if (gesture && gesture !== this.lastGesture) {
                // End previous gesture if any
                if (this.lastGesture) {
                    console.log('Gesture ended:', this.lastGesture);
                    this.currentMode.onGestureEnd(this.lastGesture, this.lastPosition);
                }

                // Start new gesture
                const position = gesture === 'one_finger' ? canvasFingerTip : canvasPosition;
                console.log('Gesture started:', gesture, position);
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
            nightsky: '🌙 Night Sky',
            garden: '🌸 Garden',
            magic: '✨ Magic'
        };

        this.modeStatus.textContent = modeNames[this.currentModeName];
    }

    /**
     * Start animation loop
     */
    startAnimationLoop() {
        let lastTime = performance.now();

        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw current mode effects
            if (this.currentMode && this.isRunning) {
                this.currentMode.update(deltaTime);
                this.currentMode.draw(this.ctx);
            }

            // Continue loop
            this.animationFrameId = requestAnimationFrame(animate);
        };

        animate(performance.now());
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
