var MODE;
switch (location.search){
	case '?vml': MODE = require('../modes/vml'); break;
	case '?svg': MODE = require('../modes/svg'); break;
	case '?canvas': MODE = require('../modes/canvas'); break;
	case '?dom': MODE = require('../modes/dom'); break;
	default: MODE = require('../modes/fast');
}
require('../modes/current').setCurrent(MODE);
module.exports = MODE;