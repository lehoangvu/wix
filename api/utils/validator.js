module.exports = {
	max: (str = '', maxLength = 1, errorText = null) => {
		return str.length <= maxLength ? true : (errorText ? errorText : `Không thể dài hơn ${maxLength} ký tự`)
	},
	min: (str = '', minLength = 0, errorText = null) => {
		return str.length >= minLength ? true : (errorText ? errorText : `Không thể ngắn hơn hơn ${minLength} ký tự`)
	},
	isDomain: (domain = '', errorText = '') => {
	  if (!domain) return errorText ? errorText : 'Domain không đúng';
	  var re = /^(?!:\/\/)([a-zA-Z0-9-]+\.){0,5}[a-zA-Z0-9-][a-zA-Z0-9-]+\.[a-zA-Z]{2,64}?$/gi;
	  return re.test(domain) ? true : (errorText ? errorText : 'Domain không đúng');
	}
}