/**
 * Hand Gesture Detector using MediaPipe Hands
 * Detects three gestures: Open Palm, Closed Fist, One Finger Extended
 */

export class GestureDetector {
    constructor(videoElement, onResults) {
        this.videoElement = videoElement;
        this.onResults = onResults;
        this.hands = null;
        this.camera = null;
        this.currentGesture = null;
        this.handPosition = null;
        this.fingerTipPosition = null;
    }

    /**
     * Initialize MediaPipe Hands
     */
    async initialize() {
        // Initialize MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults((results) => this.processResults(results));

        // Initialize camera
        const camera = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: this.videoElement });
            },
            width: 1280,
            height: 720
        });

        await camera.start();
        this.camera = camera;
    }

    /**
     * Process hand detection results
     */
    processResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Detect gesture type
            const gesture = this.detectGesture(landmarks);
            const position = this.getHandCenter(landmarks);
            const fingerTip = this.getFingerTip(landmarks);

            // Check if gesture changed
            const gestureChanged = this.currentGesture !== gesture;

            this.currentGesture = gesture;
            this.handPosition = position;
            this.fingerTipPosition = fingerTip;

            // Call results callback
            if (this.onResults) {
                this.onResults({
                    gesture,
                    position,
                    fingerTip,
                    gestureChanged,
                    landmarks
                });
            }
        } else {
            // No hand detected
            if (this.currentGesture !== null) {
                if (this.onResults) {
                    this.onResults({
                        gesture: null,
                        position: null,
                        fingerTip: null,
                        gestureChanged: true,
                        landmarks: null
                    });
                }
            }
            this.currentGesture = null;
            this.handPosition = null;
            this.fingerTipPosition = null;
        }
    }

    /**
     * Detect gesture type from hand landmarks
     * @returns {string} 'open_palm', 'closed_fist', or 'one_finger'
     */
    detectGesture(landmarks) {
        // Get fingertip and base positions
        const fingers = {
            thumb: { tip: landmarks[4], base: landmarks[2] },
            index: { tip: landmarks[8], base: landmarks[6] },
            middle: { tip: landmarks[12], base: landmarks[10] },
            ring: { tip: landmarks[16], base: landmarks[14] },
            pinky: { tip: landmarks[20], base: landmarks[18] }
        };

        // Calculate which fingers are extended
        const extended = {
            thumb: this.isThumbExtended(landmarks),
            index: this.isFingerExtended(fingers.index),
            middle: this.isFingerExtended(fingers.middle),
            ring: this.isFingerExtended(fingers.ring),
            pinky: this.isFingerExtended(fingers.pinky)
        };

        const extendedCount = Object.values(extended).filter(v => v).length;

        // Detect gestures
        // One finger: only index finger extended
        if (extended.index && !extended.middle && !extended.ring && !extended.pinky) {
            return 'one_finger';
        }

        // Closed fist: no fingers extended (or just thumb)
        if (extendedCount <= 1) {
            return 'closed_fist';
        }

        // Open palm: most or all fingers extended
        if (extendedCount >= 4) {
            return 'open_palm';
        }

        // Default to previous gesture if ambiguous
        return this.currentGesture || 'closed_fist';
    }

    /**
     * Check if a finger is extended
     */
    isFingerExtended(finger) {
        const tipY = finger.tip.y;
        const baseY = finger.base.y;
        return tipY < baseY - 0.05; // Tip is above base
    }

    /**
     * Check if thumb is extended
     */
    isThumbExtended(landmarks) {
        const tip = landmarks[4];
        const base = landmarks[2];
        const wrist = landmarks[0];

        // Thumb extends to the side rather than up
        const distance = Math.abs(tip.x - wrist.x);
        const baseDistance = Math.abs(base.x - wrist.x);

        return distance > baseDistance + 0.05;
    }

    /**
     * Get hand center position (palm center)
     */
    getHandCenter(landmarks) {
        const wrist = landmarks[0];
        const middleBase = landmarks[9];

        return {
            x: (wrist.x + middleBase.x) / 2,
            y: (wrist.y + middleBase.y) / 2
        };
    }

    /**
     * Get index finger tip position
     */
    getFingerTip(landmarks) {
        return {
            x: landmarks[8].x,
            y: landmarks[8].y
        };
    }

    /**
     * Convert normalized coordinates to canvas coordinates
     */
    toCanvasCoords(normalizedPos, canvasWidth, canvasHeight) {
        return {
            x: normalizedPos.x * canvasWidth,
            y: normalizedPos.y * canvasHeight
        };
    }

    /**
     * Stop the detector
     */
    stop() {
        if (this.camera) {
            this.camera.stop();
        }
    }
}
