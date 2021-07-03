var app = false;
if(process.env.APP == 'client') {
	app = require('./client')(process.env.PORT || 3030)
} else if (process.env.APP == 'dash') {
	app = require('./dash')(process.env.PORT || 3031)
} else if (process.env.APP == 'cdn') {
	app = require('./cdn')(process.env.PORT || 3032)
}
