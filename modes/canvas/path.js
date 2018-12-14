var Class = require('../../core/class');
var Path = require('../../core/path');

var MOVE         = 0,
    LINE         = 1,
    BEZIER_CURVE = 2,
    ARC          = 3,
    CLOSE        = 4;

var CanvasPath = Class(Path, {

	initialize: function(path){
		this.reset();
		if (path instanceof CanvasPath){
			this.path = path.path.slice(0);
		} else if (path){
			if (path.applyToPath)
				path.applyToPath(this);
			else
				this.push(path);
		}
	},

	onReset: function(){
		this.path = [];
	},

	onMove: function(sx, sy, x, y){
		this.path.push(MOVE, x, y);
	},

	onLine: function(sx, sy, x, y){
		this.path.push(LINE, x, y);
	},

	onBezierCurve: function(sx, sy, p1x, p1y, p2x, p2y, x, y){
		this.path.push(BEZIER_CURVE, p1x, p1y, p2x, p2y, x, y);
	},

	_arcToBezier: Path.prototype.onArc,

	onArc: function(sx, sy, ex, ey, cx, cy, rx, ry, sa, ea, ccw, rotation){
		if (rx != ry || rotation) return this._arcToBezier(sx, sy, ex, ey, cx, cy, rx, ry, sa, ea, ccw, rotation);
		this.path.push(ARC, cx, cy, rx, sa, ea, ccw);
	},

	onClose: function(){
		this.path.push(CLOSE);
	},

	toCommands: function(){
		return this.path.slice(0);
	}

});

CanvasPath.MOVE = MOVE;
CanvasPath.LINE = LINE;
CanvasPath.BEZIER_CURVE = BEZIER_CURVE;
CanvasPath.ARC = ARC;
CanvasPath.CLOSE = CLOSE;

module.exports = CanvasPath;
