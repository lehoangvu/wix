import React from "react";

import Authentication from "@/components/Authentication";
import { Layout, Icon, Avatar, Popover, Button } from "antd";
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

import auth from "@/utils/auth";
import Sidebar from './Sidebar';
import { fetchMe } from '@/models/layout';

const { Header, Content } = Layout;

class MainLayout extends React.Component {
	state = {
		collapsed: false
	};

	toggle = () => {
		this.setState({
			collapsed: !this.state.collapsed
		});
	};

	render() {
		const {
			me
		} = this.props;
		return (
			<Authentication>
				<Layout>
					<Layout id="contentLayout">
						<Header className="home-header">
							<div className="flr">
								<Button icon="user">
									{me.email}
								</Button>
							</div>
						</Header>
						<Content
							style={{
								margin: "24px 16px",
								padding: 24,
								background: "#fff",
								minHeight: 280
							}}
						>
							{this.props.children}
						</Content>
					</Layout>
				</Layout>
			</Authentication>
		);
	}
}

export default connect(state => ({
	me: state.layout.me
}))(MainLayout)
