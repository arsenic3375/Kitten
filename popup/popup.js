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
        this.fatigueRate = 1.5;
        this.boredomRate = 3;
 
        this.mood = [];
 
        this.moods = [
            { mood: "starving",  test: () => this.hunger  >= 100 },
            { mood: "hungry",    test: () => this.hunger  >= 50  && this.hunger  < 100 },
            { mood: "exhausted", test: () => this.fatigue >= 100 },
            { mood: "tired",     test: () => this.fatigue >= 50  && this.fatigue < 100 },
            { mood: "bored",     test: () => this.boredom >= 50 },
        ];
 
        this.passive_behaviors = [
            { moods: ["starving"], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this),        duration: 2000 },
                { frequency: 1, behavior: this.die_hunger.bind(this), duration: 0 },
            ]},
            { moods: ["hungry", "exhausted"], behaviors: [
                { frequency: 1, behavior: this.die_fatigue.bind(this), duration: 0 },
            ]},
            { moods: ["hungry"], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this), duration: 2000 },
            ]},
            { moods: ["hungry", "bored"], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this),      duration: 2000 },
                { frequency: 2, behavior: this.lick_paw.bind(this), duration: 1500 },
            ]},
            { moods: ["exhausted"], behaviors: [
                { frequency: 1, behavior: this.sleep.bind(this), duration: 5000 },
            ]},
            { moods: ["tired", "bored"], behaviors: [
                { frequency: 1, behavior: this.nap.bind(this), duration: 4000 },
            ]},
            { moods: ["bored"], behaviors: [
                { frequency: 1, behavior: this.catch_tail.bind(this),  duration: 1500 },
                { frequency: 2, behavior: this.scratch_ear.bind(this), duration: 1000 },
            ]},
            { moods: [], behaviors: [
                { frequency: 1, behavior: this.idle.bind(this), duration: 2000 },
            ]},
        ];
 
        this.feeding_behaviors = [
            { moods: ["hungry"], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this), duration: 2000 },
            ]},
            { moods: ["bored"], behaviors: [
                { frequency: 1, behavior: this.knock_over_food.bind(this), duration: 1500 },
            ]},
            { moods: [], behaviors: [
                { frequency: 1, behavior: this.eat.bind(this), duration: 2000 },
            ]},
        ];
 
        this.playing_behaviors = [
            { moods: ["hungry"], behaviors: [
                { frequency: 1, behavior: this.angry.bind(this), duration: 1500 },
            ]},
            { moods: ["bored"], behaviors: [
                { frequency: 2, behavior: this.pet.bind(this),       duration: 1500 },
                { frequency: 2, behavior: this.jump.bind(this),      duration: 1000 },
                { frequency: 2, behavior: this.belly_rub.bind(this), duration: 1500 },
            ]},
            { moods: ["tired"], behaviors: [
                { frequency: 1, behavior: this.annoyed.bind(this), duration: 1500 },
            ]},
            { moods: [], behaviors: [
                { frequency: 1, behavior: this.ignore.bind(this), duration: 1000 },
            ]},
        ];
 
        this.current = null;
        this.queue   = [];
    }
 
    die_hunger()        { this.alive = false; }
    die_fatigue()       { this.alive = false; }
    sleep()             {}
    nap()               {}
    eat()               { this.hunger  = Math.max(0, this.hunger  - 50); }
    lick_paw()          {}
    scratch_ear()       {}
    catch_tail()        { this.boredom = Math.max(0, this.boredom - 20); }
    angry()             {}
    ignore()            {}
    annoyed()           {}
    pet()               { this.boredom = Math.max(0, this.boredom - 30); }
    jump()              {}
    belly_rub()         {}
    knock_over_food()   {}
    idle()              {}
 
    enqueue(type, choice) {
        if (!choice) return;
        const action = { type, fn: choice.behavior, duration: choice.duration, elapsed: 0 };
        const tailType = this.queue.length ? this.queue[this.queue.length - 1].type : (this.current ? this.current.type : null);
 
        if (tailType === null || tailType === type) {
            this.queue.push(action);
        } else {
            this.queue.unshift(action);
        }
    }
 
    request(behaviorList, type) {
        const moodSet = new Set(this.mood);
        const options = behaviorList
            .filter(e => e.moods.every(m => moodSet.has(m)))
            .flatMap(e => e.behaviors);
        if (options.length === 0) return;
        const weighted = options.flatMap(o => Array(o.frequency).fill(o));
        this.enqueue(type, weighted[Math.floor(Math.random() * weighted.length)]);
    }
 
    feed() { this.request(this.feeding_behaviors, "feeding"); }
    play()  { this.request(this.playing_behaviors, "playing"); }
 
    update(dt) {
        if (!this.alive) return;
 
        this.hunger  = Math.min(100, this.hunger  + this.hungerRate  * dt);
        this.fatigue = Math.min(100, this.fatigue + this.fatigueRate * dt);
        this.boredom = Math.min(100, this.boredom + this.boredomRate * dt);
 
        this.mood = this.moods.filter(m => m.test()).map(m => m.mood);
 
        if (this.current) {
            this.current.elapsed += dt * 1000;
            if (this.current.elapsed >= this.current.duration) {
                this.current = null;
            }
        }
 
        if (!this.current && this.queue.length === 0) {
            this.request(this.passive_behaviors, "passive");
        }
        
        if (!this.current && this.queue.length > 0) {
            this.current = this.queue.shift();
            this.current.fn();
        }
    }

 
    draw() {
        // TODO: render whatever this.current.fn represents
    }
}


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

const cat = new Cat();
 
feed_button.addEventListener("click", () => cat.feed());
play_button.addEventListener("click", () => cat.play());
 
let lastTimestamp = null;
 
function update(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
 
    background("rgb(255, 255, 255)");
    cat.update(dt);
    cat.draw();
 
    requestAnimationFrame(update);
}
 
requestAnimationFrame(update);