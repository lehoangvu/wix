import axios from 'axios';
import auth from './auth';

export default opts => {
	const _opts = {
		...opts
	}

	_opts.headers = _opts.headers || {}
	if(auth.get()) {
		_opts.headers['x-auth'] = auth.get()
	}

	return new Promise((resolve, reject) => {
		axios({
			baseUrl: APP_CONFIGS.api_base,
			..._opts
		})
		.then(({data}) => {
			resolve(data)
		})
		.catch((...err) => {
			reject(...err)
		})
	})
}