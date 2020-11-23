var svg = document.getElementById("cups");
var s = Snap(svg);

var simpleCup = Snap.select('#path41');
var fancyCup = Snap.select('#fancy-cup');

var simpleCupPoints = simpleCup.node.getAttribute('d');
var fancyCupPoints = fancyCup.node.getAttribute('d');
console.log(simpleCupPoints,simpleCup)
console.log(fancyCupPoints,fancyCup)

var toFancy = function(){
  simpleCup.animate({ d: fancyCupPoints }, 20000, mina.backout, ()=> {});  
}


toFancy();