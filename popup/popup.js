let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");

function background(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class Cat{
    constructor(){
        this.hunger      = 0;
        this.fatigue     = 0;
        this.boredom     = 0;
        
        this.behaviors = new Map();
        this.behaviors.set(
            {hunger_min     = 100,  hunger_max      = 100,
             fatigue_min    = 0,    fatigue_max     = 100,
             boredom_min    = 0,    boredom_max     = 100},
            {probability = 1.00, behavior = this.die_hunger}
        );
        this.behaviors.set(
            {hunger_min     = 0,    hunger_max      = 100,
             fatigue_min    = 100,  fatigue_max     = 100,
             boredom_min    = 0,    boredom_max     = 100},
            {probability = 1.00, behavior = this.die_fatiuge}
        );
        this.behaviors.set(
            {hunger_min     = 0,    hunger_max      = 50,
             fatigue_min    = 75,   fatigue_max     = 100,
             boredom_min    = 0,    boredom_max     = 50},
            {probability = 1.00, behavior = this.sleep}
        );
    }

    die_hunger() {}
    die_fatiuge() {}

    eat() {}
    sleep() {}
    play() {}

    draw() {
        let filtered_behaviors = 
        Array.from(this.behaviors .entries())
        .filter(([key, value]) => {
            return this.hunger >= key.hunger_min && this.hunger < key.hunger_max &&
                   this.fatigue >= key.fatigue_min && this.fatigue < key.fatigue_max &&
                   this.boredom >= key.boredom_min && this.boredom < key.boredom_max;
        })
        .map(([key, value]) => {value});

        //Select behavior from filtered_behaviors based on probability
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

function update() {
    background("rgb(255, 255, 255)");
    requestAnimationFrame(update);
}

update();