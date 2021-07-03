import api from '@/utils/api';

const initialState = {
  me: {
  	sites: []
  },
  menuKey: null,
  headerAdditional: null
}

export const fetchMe = () => dispatch => {
	api({
		url: "/api/me"
	}).then(data => {
		dispatch({
			type: "FETCH_ME",
			data
		})
	}).catch(error => {
		dispatch({
			type: "FETCH_ME_ERROR"
		})
	})
}

export const setHeaderAdditional = comp => dispatch => {
	dispatch({
		type: "SET_HEADER_ADDITIONAL",
		comp
	})
}

export const setMenuActive = key => dispatch => {
	dispatch({
		type: "SET_MENU_ACTIVE",
		key
	})
}

export default function update(state = initialState, action) {
	switch(action.type) {
		case 'FETCH_ME': 
			return {
				...state,
				me: action.data
			}
		case 'FETCH_ME_ERROR': 
			return {
				...state,
				me: false
			}
		case 'SET_HEADER_ADDITIONAL': 
			return {
				...state,
				headerAdditional: action.comp
			}
		case 'SET_MENU_ACTIVE': 
			return {
				...state,
				menuKey: action.key
			}
		default:
	  	return state
	}
}