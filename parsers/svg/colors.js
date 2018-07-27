var SVGParser = require('./core');

var parseColor = SVGParser.prototype.parseColor;

SVGParser.prototype.parseColor = function(value, opacity, styles){
	if (value == 'currentColor') value = styles.color;
	return parseColor.call(this, value, opacity, styles);
};
