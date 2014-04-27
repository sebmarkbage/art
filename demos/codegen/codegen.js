require('../../modes/script');
var ART = require('../../index');

var art = new ART.Surface(100, 100);

var tripath = new ART.Path()
	.move(50, 0)
	.line(50, 100)
	.line(-100, 0)
	.line(50, -100)
	.close();

var triangle = new ART.Shape(tripath).fill('rgb(255, 0, 0)');

var rectangle = new ART.Rectangle(100, 100).rotate(45).stroke('#0F0', 2);

art.grab(triangle, rectangle);

function showResult(text) {
  var result = document.createElement('textarea');
  result.style.width = '500px';
  result.style.height = '300px';
  result.value = text;
  document.body.appendChild(result);
}

showResult(art.toExpression().toString());
showResult(art.toModule().toString());