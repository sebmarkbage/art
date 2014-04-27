require('../mode');
var ART = require('../../index');
var Morph = require('../../morph/path');


var canvas = ART.Surface(1000, 1000);

var square = Morph.Path()
	.move(0,0)
	.line(100,0)
	.line(0,100)
	.line(-100,0)
	.close();

var circle = Morph.Path()
	.moveTo(50,0)
	.arc(0,100, 50)
	.arc(0,-100, 50)
	.close();

var transition = Morph.Tween(square, circle);

var shape = ART.Shape()
	.fill('#F00')
	.inject(canvas);

var start = +new Date(), timer = setInterval(function(){
	var delta = (new Date() - start) / 1000;
	if (delta > 1){
		delta = 1;
		clearInterval(timer);
	}
	transition.tween(delta);
	shape.draw(transition);
}, 1000 / 60);

canvas.inject(document.body);