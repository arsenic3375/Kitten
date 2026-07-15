function rotateToMouse(card) {
    return function(e) {
        let bounds = card.getBoundingClientRect();
        //mouse coordinates relative to bounds
        let mouse = {
            x: e.clientX - bounds.x,
            y: e.clientY - bounds.y
        }

        //center coordinates relative to bounds
        let center = {
            x: bounds.width / 2,
            y: bounds.height / 2
        }

        //poisiton vector of mouse
        let center_mouse = {
            x: mouse.x - center.x,
            y: mouse.y - center.y
        }

        const distance = Math.sqrt(center_mouse.x**2 + center_mouse.y**2);
    
        card.querySelector('.glow').style.backgroundImage = `
        radial-gradient(circle at ${mouse.x}px ${mouse.y}px, #ffffff55, #0000000f)`;

        card.style.transform = `
        rotate3d(${center_mouse.y}, ${-center_mouse.x}, 0, ${Math.log(distance)*5}deg)`;
    }
}

let card_containers = document.querySelectorAll(".card_container");
console.log(card_containers);

card_containers.forEach(card_container => {   

    let card = card_container.querySelector('.card');
    let handler = rotateToMouse(card);

    card_container.addEventListener('mouseenter', () => {
        document.addEventListener('mousemove', handler);
    });
  
    
    card_container.addEventListener('mouseleave', () => {
        document.removeEventListener('mousemove', handler);
        card.style.transform = '';
        card.querySelector('.glow').style.backgroundImage = '';
    });
    
});
