const config = require('config')
const express = require('express')
const path = require('path')
const api = require('./api')
const app = express()

app.use('/frontend-dist', express.static(path.resolve(__dirname, "dist")));
app.use('/static', express.static(path.resolve(__dirname, "static")));

app.use('/api', api.app)

app.set('view engine', 'ejs');
app.use('/', (req, res, next) => {
	res.render(path.resolve(__dirname, "dash.ejs"), {
		APP_CONFIGS: {
			api_base: config.get('api_base'),
			media_api: config.get('media_api')
		}
	})
})



module.exports = port => {
	api.prepare()
	.then(function(){
			app.listen(port, function() {
				console.log(`> Ready on http://localhost:${port}`);
			});
	})
}