import api from '@/utils/api';

const initialState = {
  sites: [],
  siteLoading: true,
  total: 0
}

export const fetchSite = (page) => dispatch => {
	api({
		url: `/api/site?page=${page}`
	}).then(data => {
		dispatch({
			type: "FETCH_SITE",
			data
		})
	}).catch(error => {

	})
}

export default function update(state = initialState, action) {
	switch(action.type) {
		case 'FETCH_SITE': 
			return {
				...state,
				sites: action.data.data,
				siteLoading: false,
				total: action.data.total
			}
		default:
	  	return state
	}
}