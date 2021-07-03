import React from 'react'
import {connect} from 'react-redux'
import isEqual from 'lodash/isEqual'
import auth from "@/utils/auth";
import { fetchMe } from '@/models/layout';
import { withRouter } from 'react-router'

class Authentication extends React.Component {
	
	componentDidMount() {
		if (!auth.isLogin()) {
			this.props.router.replace("/auth/login");
		} else {
			this.props.dispatch(fetchMe())
		}
	}

	componentDidUpdate(prevProps) {
		if(!isEqual(prevProps.me, this.props.me) && this.props.me == false) {
			auth.set(null)
			this.props.router.replace("/auth/login");
		}
	}

	render() {
		return <React.Fragment>{this.props.children}</React.Fragment>;		
	}
}

export default connect(state => {
	return {
		me: state.layout.me
	}	
})(withRouter(Authentication))