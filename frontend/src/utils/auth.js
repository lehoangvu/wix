const ACCESS_TOKEN = 'wix-access-token'

const isLogin = () => {
	return localStorage.getItem(ACCESS_TOKEN) != null
}

const set = (token) => {
	return localStorage.setItem(ACCESS_TOKEN, token)
}
const get = () => {
	return localStorage.getItem(ACCESS_TOKEN)
}

export default {
	isLogin,
	set,
	get,
}