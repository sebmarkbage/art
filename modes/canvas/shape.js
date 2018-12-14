var Class = require('../../core/class');
var Base = require('./base');
var Path = require('./path');

var MOVE = Path.MOVE;
var LINE = Path.LINE;
var BEZIER_CURVE = Path.BEZIER_CURVE;
var ARC = Path.ARC;
var CLOSE = Path.CLOSE;

function executeCommands(context, commands) {
	var i = 0, l = commands.length, cmd;
	while (i < l) {
		cmd = commands[i++];
		switch (cmd) {
		case MOVE:
			context.moveTo(commands[i++], commands[i++]);
			break;
		case LINE:
			context.lineTo(commands[i++], commands[i++]);
			break;
		case BEZIER_CURVE:
			context.bezierCurveTo(
				commands[i++], commands[i++], commands[i++],
				commands[i++], commands[i++], commands[i++]);
		      break;
		case ARC:
			context.arc(
				commands[i++], commands[i++], commands[i++],
				commands[i++], commands[i++], commands[i++]);
			break;
		case CLOSE:
			context.closePath();
			break;
		}
	}
}

module.exports = Class(Base, {

	base_initialize: Base.prototype.initialize,

	initialize: function(path, width, height){
		this.base_initialize();
		this.width = width;
		this.height = height;
		if (path != null) this.draw(path);
	},

	draw: function(path, width, height){
		if (!(path instanceof Path)) path = new Path(path);
		this.path = path;
		this._commands = path.toCommands();
		if (width != null) this.width = width;
		if (height != null) this.height = height;
		return this.invalidate();
	},

	localHitTest: function(x, y){
		if (!this._fill) return null;
		if (this.width == null || this.height == null){
			var context = Base._genericContext, commands = this._commands;
			if (!commands) return null;
			context.beginPath();
			executeCommands(context, commands);
			return context.isPointInPath(x, y) ? this : null;
		}
		if (x > 0 && y > 0 && x < this.width && y < this.height){
			return this;
		}
		return null;
	},

	renderShapeTo: function(context){
		if (this._invisible || !this._commands || (!this._fill && !this._stroke)) {
			return null;
		}
		context.transform(this.xx, this.yx, this.xy, this.yy, this.x, this.y);
		var commands = this._commands,
		    fill = this._fill,
		    stroke = this._stroke,
		    dash = this._strokeDash;

		context.beginPath();

		if (dash) {
			if (context.setLineDash) {
				context.setLineDash(dash);
			} else {
				// TODO: Remove when FF supports setLineDash.
				context.mozDash = dash;
			}
			// TODO: Create fallback to other browsers.
		} else {
			if (context.setLineDash) {
				context.setLineDash([]);
			} else {
				context.mozDash = null;
			}
		}

		executeCommands(context, commands);

		if (fill){
			var m = this._fillTransform;
			if (m){
				context.save(); // TODO: Optimize away this by restoring the transform before stroking
				context.transform(m.xx, m.yx, m.xy, m.yy, m.x, m.y);
				context.fillStyle = fill;
				context.fill();
				context.restore();
			} else {
				context.fillStyle = fill;
				context.fill();
			}
		}
		if (stroke){
			context.strokeStyle = stroke;
			context.lineWidth = this._strokeWidth;
			context.lineCap = this._strokeCap;
			context.lineJoin = this._strokeJoin;
			context.stroke();
		}
	}

});
