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
        
        this.max_hunger  = 100;
        this.max_fatigue = 100;
        this.max_boredom = 100;


    }

    eat() {}
    sleep() {}
    play() {}

    draw() {}
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