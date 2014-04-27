exports.Surface = require('./vml/surface');
exports.Path = require('./vml/path');
exports.Shape = require('./vml/shape');
exports.Group = require('./vml/group');
exports.ClippingRectangle = require('./vml/group');
exports.Text = require('./vml/text');

var DOM = require('./vml/dom');
if (typeof document !== 'undefined') DOM.init(document);

require('./current').setCurrent(exports);
