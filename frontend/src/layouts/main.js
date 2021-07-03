import React from "react";

import Authentication from "@/components/Authentication";
import { Layout, Icon, Select } from "antd";
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import Sidebar from './Sidebar';

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

	handleChangeSite = value => {
		const {router} = this.props
		
		this.props.router.replace(router.location.pathname.replace(router.params.siteId, value.key));
	}

	render() {
		const {
			me,
			headerAdditional,
			router
		} = this.props;
		const {siteId} = router.params
		const selectedSites = me.sites.filter(item => item.id == siteId)
		return (
			<Authentication>
				<Layout>
					<Sidebar collapsed={this.state.collapsed} />
					<Layout id="contentLayout">
						<Header style={{ background: "#fff", padding: 0 }}>

							<Icon
								className="trigger-sidebar"
								type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
								onClick={this.toggle}
							/>
							{
								selectedSites.length === 0 && <Select loading={true} />

							}
							{
								selectedSites.length > 0 && <Select size="large" style={{ minWidth: 220 }} onChange={this.handleChangeSite} labelInValue defaultValue={{key: selectedSites[0].id, label: selectedSites[0].domain}}>
									{
										me.sites.map((site, index) => {
											return <Select.Option key={index} value={site.id}>{site.domain}</Select.Option>
										})
									}
								</Select>
							}
							<div className="header-additionnal">
								{headerAdditional}
							</div>
						</Header>
						<Content
							style={{
								padding: '8px 24px',
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
	me: state.layout.me,
	headerAdditional: state.layout.headerAdditional,
	siteLoading: state.home.siteLoading
}))(MainLayout)
