function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function randomFloat (low, high) {
    return Math.random() * (high - low) + low;
}
function kontroll (){
console.log(randomInt(45,48));

console.log(randomFloat(45,48).toFixed(2));
}

setInterval(kontroll, 2000);
