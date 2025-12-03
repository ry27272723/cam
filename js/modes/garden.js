/**
 * Garden Mode
 * Visual effects inspired by nature and gardens
 *
 * Gestures:
 * - Closed Fist: Rainfall effect appears below the fist
 * - Open Palm: Flower stems rise from bottom at palm's horizontal position
 * - One Finger: Blooming flower follows the fingertip
 *
 * Visual references available in GitHub (user will provide links)
 */

import { Effect, Particle, Utils } from '../effects.js';

/**
 * Raindrop Effect
 */
class Raindrop extends Effect {
    constructor(x, y) {
        super();
        this.x = x + Utils.random(-30, 30);
        this.y = y;
        this.speed = Utils.random(5, 10);
        this.length = Utils.random(10, 20);
        this.opacity = Utils.random(0.3, 0.7);
        this.maxY = y + 300; // Fall down to this point
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.y += this.speed;

        if (this.y > this.maxY) {
            this.isActive = false;

            // Could add splash effect here
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();

        ctx.restore();
    }
}

/**
 * Rain Effect
 * Creates rainfall below the fist position
 */
class Rain extends Effect {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.raindrops = [];
        this.spawnRate = 100; // milliseconds between spawns
        this.timeSinceLastSpawn = 0;
        this.radius = 60; // Rain area radius
    }

    update(deltaTime, x, y) {
        super.update(deltaTime);

        if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
        }

        this.timeSinceLastSpawn += deltaTime;

        // Spawn new raindrops
        if (this.timeSinceLastSpawn >= this.spawnRate) {
            for (let i = 0; i < 3; i++) {
                this.raindrops.push(new Raindrop(this.x, this.y));
            }
            this.timeSinceLastSpawn = 0;
        }

        // Update raindrops
        this.raindrops.forEach(drop => drop.update(deltaTime));
        this.raindrops = this.raindrops.filter(drop => !drop.isDead());
    }

    draw(ctx) {
        this.raindrops.forEach(drop => drop.draw(ctx));
    }

    clear() {
        this.raindrops = [];
    }
}

/**
 * Flower Species Definitions
 */
const FlowerSpecies = {
    rose: {
        petalColor: '#ff6b9d',
        centerColor: '#ffd93d',
        petalCount: 8,
        petalSize: 15
    },
    daisy: {
        petalColor: '#ffffff',
        centerColor: '#ffeb3b',
        petalCount: 12,
        petalSize: 12
    },
    tulip: {
        petalColor: '#e91e63',
        centerColor: '#880e4f',
        petalCount: 6,
        petalSize: 18
    },
    sunflower: {
        petalColor: '#ffd93d',
        centerColor: '#8b4513',
        petalCount: 16,
        petalSize: 20
    },
    lavender: {
        petalColor: '#b19cd9',
        centerColor: '#7b68ee',
        petalCount: 5,
        petalSize: 10
    }
};

/**
 * Flower Effect
 */
class Flower extends Effect {
    constructor(x, y, species) {
        super();
        this.x = x;
        this.y = y;
        this.species = species;
        this.growthProgress = 0;
        this.bloomProgress = 0;
        this.targetHeight = Utils.random(80, 150);
        this.sway = Utils.random(0, Math.PI * 2);
        this.swaySpeed = Utils.random(0.001, 0.002);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Grow stem
        if (this.growthProgress < 1) {
            this.growthProgress += deltaTime * 0.002;
            this.growthProgress = Math.min(1, this.growthProgress);
        }

        // Bloom after stem is grown
        if (this.growthProgress >= 1 && this.bloomProgress < 1) {
            this.bloomProgress += deltaTime * 0.003;
            this.bloomProgress = Math.min(1, this.bloomProgress);
        }

        // Gentle sway
        this.sway += this.swaySpeed * deltaTime;
    }

    draw(ctx) {
        const currentHeight = this.targetHeight * this.growthProgress;
        const swayOffset = Math.sin(this.sway) * 5;

        ctx.save();

        // Draw stem
        ctx.strokeStyle = '#4a7c4e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.quadraticCurveTo(
            this.x + swayOffset * 0.5,
            this.y - currentHeight * 0.5,
            this.x + swayOffset,
            this.y - currentHeight
        );
        ctx.stroke();

        // Draw leaves if stem is partially grown
        if (this.growthProgress > 0.3) {
            this.drawLeaves(ctx, swayOffset, currentHeight);
        }

        // Draw flower head if blooming
        if (this.bloomProgress > 0) {
            this.drawFlowerHead(
                ctx,
                this.x + swayOffset,
                this.y - currentHeight,
                this.bloomProgress
            );
        }

        ctx.restore();
    }

    drawLeaves(ctx, swayOffset, currentHeight) {
        const leafY1 = this.y - currentHeight * 0.3;
        const leafY2 = this.y - currentHeight * 0.6;

        ctx.fillStyle = '#5a9c5e';

        // Left leaf
        ctx.beginPath();
        ctx.ellipse(
            this.x + swayOffset * 0.3 - 10,
            leafY1,
            8, 15, -Math.PI / 6, 0, Math.PI * 2
        );
        ctx.fill();

        // Right leaf
        ctx.beginPath();
        ctx.ellipse(
            this.x + swayOffset * 0.6 + 10,
            leafY2,
            8, 15, Math.PI / 6, 0, Math.PI * 2
        );
        ctx.fill();
    }

    drawFlowerHead(ctx, x, y, bloomProgress) {
        const spec = FlowerSpecies[this.species];

        // Draw petals
        const petalSize = spec.petalSize * bloomProgress;
        const angleStep = (Math.PI * 2) / spec.petalCount;

        ctx.fillStyle = spec.petalColor;

        for (let i = 0; i < spec.petalCount; i++) {
            const angle = i * angleStep;
            const petalX = x + Math.cos(angle) * petalSize * 0.6;
            const petalY = y + Math.sin(angle) * petalSize * 0.6;

            ctx.save();
            ctx.translate(petalX, petalY);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.ellipse(0, 0, petalSize * 0.6, petalSize * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Draw center
        ctx.fillStyle = spec.centerColor;
        ctx.beginPath();
        ctx.arc(x, y, petalSize * 0.4 * bloomProgress, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Rising Flowers Effect
 * Flowers grow from the bottom at palm position
 */
class RisingFlowers extends Effect {
    constructor(x, canvasHeight) {
        super();
        this.x = x;
        this.canvasHeight = canvasHeight;
        this.flowers = [];

        // Create a few flowers at varying positions
        const flowerCount = Utils.randomInt(2, 4);
        const species = Object.keys(FlowerSpecies);

        for (let i = 0; i < flowerCount; i++) {
            const offsetX = Utils.random(-40, 40);
            const randomSpecies = species[Math.floor(Math.random() * species.length)];

            this.flowers.push(new Flower(
                this.x + offsetX,
                this.canvasHeight,
                randomSpecies
            ));
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.flowers.forEach(flower => flower.update(deltaTime));

        // Mark as inactive after flowers are fully grown
        if (this.age > 3000 && this.flowers.every(f => f.bloomProgress >= 1)) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        this.flowers.forEach(flower => flower.draw(ctx));
    }
}

/**
 * Following Bloom Effect
 * Single flower that follows the fingertip
 */
class FollowingBloom extends Effect {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;

        // Random species
        const species = Object.keys(FlowerSpecies);
        this.species = species[Math.floor(Math.random() * species.length)];

        this.bloomProgress = 0;
        this.rotation = 0;
    }

    update(deltaTime, x, y) {
        super.update(deltaTime);

        if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
        }

        // Bloom gradually
        if (this.bloomProgress < 1) {
            this.bloomProgress += deltaTime * 0.005;
            this.bloomProgress = Math.min(1, this.bloomProgress);
        }

        // Rotate gently
        this.rotation += deltaTime * 0.001;
    }

    draw(ctx) {
        const spec = FlowerSpecies[this.species];
        const size = 25 * this.bloomProgress;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw petals
        const angleStep = (Math.PI * 2) / spec.petalCount;

        ctx.fillStyle = spec.petalColor;

        for (let i = 0; i < spec.petalCount; i++) {
            const angle = i * angleStep;
            const petalX = Math.cos(angle) * size * 0.5;
            const petalY = Math.sin(angle) * size * 0.5;

            ctx.save();
            ctx.translate(petalX, petalY);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.ellipse(0, 0, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Draw center
        ctx.fillStyle = spec.centerColor;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Add shimmer
        if (this.bloomProgress >= 1) {
            const shimmer = Math.sin(this.age * 0.005) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${shimmer * 0.3})`;
            ctx.beginPath();
            ctx.arc(size * -0.15, size * -0.15, size * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

/**
 * Garden Mode Controller
 */
export class GardenMode {
    constructor(canvasHeight) {
        this.name = 'Garden';
        this.canvasHeight = canvasHeight;
        this.currentEffect = null;
        this.risingFlowers = [];
        this.lastGesture = null;
    }

    /**
     * Handle gesture start
     */
    onGestureStart(gesture, position) {
        this.lastGesture = gesture;

        if (gesture === 'closed_fist') {
            this.currentEffect = new Rain(position.x, position.y);
        } else if (gesture === 'one_finger') {
            this.currentEffect = new FollowingBloom(position.x, position.y);
        }
    }

    /**
     * Handle gesture movement
     */
    onGestureMove(gesture, position) {
        if (this.currentEffect) {
            if (this.currentEffect instanceof Rain) {
                this.currentEffect.update(16, position.x, position.y);
            } else if (this.currentEffect instanceof FollowingBloom) {
                this.currentEffect.update(16, position.x, position.y);
            }
        }
    }

    /**
     * Handle gesture end
     */
    onGestureEnd(gesture, position) {
        if (gesture === 'open_palm' && position) {
            this.risingFlowers.push(new RisingFlowers(position.x, this.canvasHeight));
        }

        this.currentEffect = null;
        this.lastGesture = null;
    }

    /**
     * Update all effects
     */
    update(deltaTime) {
        if (this.currentEffect) {
            this.currentEffect.update(deltaTime);
        }

        this.risingFlowers.forEach(flowers => flowers.update(deltaTime));
        this.risingFlowers = this.risingFlowers.filter(flowers => !flowers.isDead());
    }

    /**
     * Draw all effects
     */
    draw(ctx) {
        // Draw rising flowers
        this.risingFlowers.forEach(flowers => flowers.draw(ctx));

        // Draw current effect
        if (this.currentEffect) {
            this.currentEffect.draw(ctx);
        }
    }

    /**
     * Clear all effects
     */
    clear() {
        this.currentEffect = null;
        this.risingFlowers = [];
    }

    /**
     * Update canvas height (for responsiveness)
     */
    setCanvasHeight(height) {
        this.canvasHeight = height;
    }
}
