const path = require('path')
const cdn = require('./cdn/index')

module.exports = port => {
	cdn.prepare()
	.then(function(){
			cdn.app.listen(port, function() {
				console.log(`> Ready on http://localhost:${port}`);
			});
	})
}