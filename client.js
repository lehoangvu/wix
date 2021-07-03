const path = require('path')
const client = require('./client/index')

module.exports = port => {
	client.prepare()
	.then(function(){
			client.app.listen(port, function() {
				console.log(`> Ready on http://localhost:${port}`);
			});
	})
}