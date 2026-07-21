/*
Core Game Loop:
    Cat starts of fine, as it continues living, it accumulates: hunger, fatigue, boredom
    Feed cat to reduce hunger
    Play with cat to reduce bordeom
    
    if cat is too hungry, it will die
    if cat is too tired, it will die
    if cat is too tired and not too hungry or too bored, it will sleep
    
    If cat is too hungry and you play with it, it will be angry
    If cat is not bored and you play with it, it will ignore you
    If cat is too tired and you play with it, it will be anoyed

    if cat is too bored and not hungry and you feed it, it will knock over food

    I am thinking of more behavior to add later

    You can play with cat by stroking it with cursor, or holding down on mousepad to shine laser
    Cat will be happy when you play with it
    Cat Will be happy when you feed it
    Cat will be happy while asleep

    I need to add a bunch of canvas animations for all of these, as well as sounds of purring and such
    I need to be able to select from a set of matching combinations that fit the current values for hunger, fatigue, boredom

    EX:
        //type examples here
*/

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const feed_button = document.getElementById("X");
const play_button = document.getElementById("O");

function background(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class Cat {
    constructor() {
        this.hunger  = 0;
        this.fatigue = 0;
        this.boredom = 0;
        this.alive   = true;

        this.hungerRate  = 2;
        this.fatigueRate = 1;
        this.boredomRate = 3;

        this.food         = 0;
        this.foodCapacity = 100;
        this.foodPerFill  = 25;
        this.foodPerBite  = 25;

        this.mood  = [];
        this.environment = [];
        this.state = [];

        this.moodRules = [
            { mood: "starving",  test: () => this.hunger  >= 100 },
            { mood: "hungry",    test: () => this.hunger  >= 50  && this.hunger  < 100 },
            { mood: "exhausted", test: () => this.fatigue >= 100 },
            { mood: "tired",     test: () => this.fatigue >= 50  && this.fatigue < 100 },
            { mood: "bored",     test: () => this.boredom >= 50 },
        ];

        this.environmentRules = [
            { environment: "food_available", test: () => this.food > 0 },
            { environment: "food_empty",     test: () => this.food <= 0 },
        ];

        //voodo
        this.animations = {
            eat:              { image: null, frameWidth: 64, frameHeight: 64, frameCount: 6, fps: 8, loop: false },
            die_hunger:       { image: null, frameWidth: 64, frameHeight: 64, frameCount: 8, fps: 6, loop: false },
            die_fatigue:      { image: null, frameWidth: 64, frameHeight: 64, frameCount: 8, fps: 6, loop: false },
            sleep:            { image: null, frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 2, loop: true  },
            nap:              { image: null, frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 2, loop: true  },
            lick_paw:         { image: null, frameWidth: 64, frameHeight: 64, frameCount: 5, fps: 6, loop: false },
            scratch_ear:      { image: null, frameWidth: 64, frameHeight: 64, frameCount: 5, fps: 6, loop: false },
            catch_tail:       { image: null, frameWidth: 64, frameHeight: 64, frameCount: 6, fps: 10, loop: false },
            angry:            { image: null, frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 6, loop: true  },
            ignore:           { image: null, frameWidth: 64, frameHeight: 64, frameCount: 1, fps: 1, loop: true  },
            annoyed:          { image: null, frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 6, loop: true  },
            pet:              { image: null, frameWidth: 64, frameHeight: 64, frameCount: 5, fps: 6, loop: false },
            jump:             { image: null, frameWidth: 64, frameHeight: 64, frameCount: 6, fps: 10, loop: false },
            belly_rub:        { image: null, frameWidth: 64, frameHeight: 64, frameCount: 5, fps: 6, loop: false },
            knock_over_food:  { image: null, frameWidth: 64, frameHeight: 64, frameCount: 6, fps: 8, loop: false },
            beg:              { image: null, frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 4, loop: true  },
            idle:             { image: null, frameWidth: 64, frameHeight: 64, frameCount: 4, fps: 2, loop: true  },
        };

        const clipDuration = name => {
            const a = this.animations[name];
            return Math.round((a.frameCount / a.fps) * 1000);
        };

        this.passive_behaviors = [
            { state: ["starving", "food_available"], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this),        animation: "eat",        duration: clipDuration("eat") },
                { frequency: 1, behavior: this.die_hunger.bind(this), animation: "die_hunger", duration: clipDuration("die_hunger") },
            ]},
            { state: ["starving", "food_empty"], behaviors: [
                { frequency: 1, behavior: this.die_hunger.bind(this), animation: "die_hunger", duration: clipDuration("die_hunger") },
            ]},
            { state: ["hungry", "exhausted"], behaviors: [
                { frequency: 1, behavior: this.die_fatigue.bind(this), animation: "die_fatigue", duration: clipDuration("die_fatigue") },
            ]},
            { state: ["hungry", "food_available"], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this), animation: "eat", duration: clipDuration("eat") },
            ]},
            { state: ["hungry", "food_empty"], behaviors: [
                { frequency: 1, behavior: this.beg_for_food.bind(this), animation: "beg", duration: 1500 },
            ]},
            { state: ["hungry", "bored", "food_available"], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this),      animation: "eat",      duration: clipDuration("eat") },
                { frequency: 2, behavior: this.lick_paw.bind(this), animation: "lick_paw", duration: clipDuration("lick_paw") },
            ]},
            { state: ["exhausted"], behaviors: [
                { frequency: 1, behavior: this.sleep.bind(this), animation: "sleep", duration: 5000 },
            ]},
            { state: ["tired", "bored"], behaviors: [
                { frequency: 1, behavior: this.nap.bind(this), animation: "nap", duration: 4000 },
            ]},
            { state: ["bored"], behaviors: [
                { frequency: 1, behavior: this.catch_tail.bind(this),  animation: "catch_tail",  duration: clipDuration("catch_tail") },
                { frequency: 2, behavior: this.scratch_ear.bind(this), animation: "scratch_ear", duration: clipDuration("scratch_ear") },
            ]},
            { state: [], behaviors: [
                { frequency: 1, behavior: this.idle.bind(this), animation: "idle", duration: 2000 },
            ]},
        ];

        this.feeding_behaviors = [
            { state: ["hungry", "food_available"], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this), animation: "eat", duration: clipDuration("eat") },
            ]},
            { state: ["bored"], behaviors: [
                { frequency: 1, behavior: this.knock_over_food.bind(this), animation: "knock_over_food", duration: clipDuration("knock_over_food") },
            ]},
            { state: [], behaviors: [
                { frequency: 1, behavior: this.ignore.bind(this), animation: "ignore", duration: 800 },
            ]},
        ];

        this.playing_behaviors = [
            { state: ["hungry"], behaviors: [
                { frequency: 1, behavior: this.angry.bind(this), animation: "angry", duration: 1500 },
            ]},
            { state: ["bored"], behaviors: [
                { frequency: 2, behavior: this.pet.bind(this),       animation: "pet",       duration: clipDuration("pet") },
                { frequency: 2, behavior: this.jump.bind(this),      animation: "jump",      duration: clipDuration("jump") },
                { frequency: 2, behavior: this.belly_rub.bind(this), animation: "belly_rub", duration: clipDuration("belly_rub") },
            ]},
            { state: ["tired"], behaviors: [
                { frequency: 1, behavior: this.annoyed.bind(this), animation: "annoyed", duration: 1500 },
            ]},
            { state: [], behaviors: [
                { frequency: 1, behavior: this.ignore.bind(this), animation: "ignore", duration: 1000 },
            ]},
        ];

        this.current = null;
        this.queue   = [];
    }

    die_hunger() { this.alive = false; }
    die_fatigue() { this.alive = false; }
    sleep() {}
    nap() {}
    eat() {
        const bite = Math.min(this.food, this.foodPerBite);
        this.food  -= bite;
        this.hunger = Math.max(0, this.hunger - 50);
    }
    beg_for_food() {}
    lick_paw() {}
    scratch_ear() {}
    catch_tail() { this.boredom = Math.max(0, this.boredom - 20); }
    angry() {}
    ignore() {}
    annoyed() {}
    pet() { this.boredom = Math.max(0, this.boredom - 30); }
    jump() {}
    belly_rub() {}
    knock_over_food() { this.food = 0; }
    idle() {}

    enqueue(type, choice) {
        if (!choice) return;
        const action = {
            type,
            fn: choice.behavior,
            animation: choice.animation,
            duration: choice.duration,
            elapsed: 0,
        };
        const tailType = this.queue.length
            ? this.queue[this.queue.length - 1].type
            : (this.current ? this.current.type : null);

        if (tailType === null || tailType === type) {
            this.queue.push(action);
        } else {
            this.queue.unshift(action);
        }
    }

    request(behaviorList, type) {
        const stateSet = new Set(this.state);
        const options = behaviorList
            .filter(e => e.state.every(c => stateSet.has(c)))
            .flatMap(e => e.behaviors);
        if (options.length === 0) return;
        const weighted = options.flatMap(o => Array(o.frequency).fill(o));
        this.enqueue(type, weighted[Math.floor(Math.random() * weighted.length)]);
    }

    feed() {
        this.food = Math.min(this.foodCapacity, this.food + this.foodPerFill);
        this.request(this.feeding_behaviors, "feeding");
    }
    
    play() {
        this.request(this.playing_behaviors, "playing");
    }

    update(dt) {
        if (!this.alive) return;

        this.hunger  = Math.min(100, this.hunger  + this.hungerRate  * dt / 1000);
        this.fatigue = Math.min(100, this.fatigue + this.fatigueRate * dt / 1000);
        this.boredom = Math.min(100, this.boredom + this.boredomRate * dt / 1000);

        this.mood = this.moodRules.filter(m => m.test()).map(m => m.mood);
        this.environment = this.environmentRules.filter(e => e.test()).map(e => e.environment);
        this.state = [...this.mood, ...this.environment];

        if (this.current) {
            this.current.elapsed += dt;
            if (this.current.elapsed >= this.current.duration) {
                this.current = null;
            }
        }

        if (!this.current && this.queue.length === 0) {
            this.request(this.passive_behaviors, "idle");
        }

        if (!this.current && this.queue.length > 0) {
            this.current = this.queue.shift();
            this.current.fn();
        }
    }

    //voodo
    draw() {
        if (!this.current) return;
        const anim = this.animations[this.current.animation];
        if (!anim || !anim.image) return;

        const elapsedSec = this.current.elapsed / 1000;
        const rawFrame = Math.floor(elapsedSec * anim.fps);
        const frame = anim.loop
            ? rawFrame % anim.frameCount
            : Math.min(anim.frameCount - 1, rawFrame);

        const sx = frame * anim.frameWidth;
        const dx = (canvas.width  - anim.frameWidth)  / 2;
        const dy = (canvas.height - anim.frameHeight) / 2;

        ctx.drawImage(
            anim.image,
            sx, 0, anim.frameWidth, anim.frameHeight,
            dx, dy, anim.frameWidth, anim.frameHeight
        );
    }
}

const cat = new Cat();

function loadAnimationImage(key, src) {
    const img = new Image();
    img.onload = () => { cat.animations[key].image = img; };
    img.src = src;
}

feed_button.addEventListener("click", () => cat.feed());
play_button.addEventListener("click", () => cat.play());

let lastTimestamp = null;

function update(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp);
    lastTimestamp = timestamp;

    background("rgb(255, 255, 255)");
    cat.update(dt);
    cat.draw();

    requestAnimationFrame(update);
}

requestAnimationFrame(update);