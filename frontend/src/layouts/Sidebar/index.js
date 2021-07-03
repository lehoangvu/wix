import React from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router'
import {routeConfig} from '@/App'
import { Layout, Icon, Menu, Avatar, Popover } from "antd";
const { Sider} = Layout;

class Sidebar extends React.Component {
	componentDidMount() {
	}
	render() {
		const {siteId} = this.props.router.params;
		const {menuKey, me, collapsed} = this.props;
		return <Sider trigger={null} collapsible collapsed={collapsed}>
		<div className="sidebar-layout">
			<div className="logo">	
				{this.props.domain}
			</div>
			<Menu theme="dark" mode="inline" selectedKeys={[menuKey]}>
				<Menu.Item key="mobile">
					<Link to={`/`}>
						<Icon type="arrow-left" />
						<span><b>Tên miền</b></span>
					</Link>
				</Menu.Item>
				<Menu.Item key="page">
					<Link to={`/site/${siteId}/page`}>
						<Icon type="file" />
						<span>Trang</span>
					</Link>
				</Menu.Item>
				<Menu.Item key="media">
					<Link to={`/site/${siteId}/media`}>
						<Icon type="picture" />
						<span>Lưu trữ</span>
					</Link>
				</Menu.Item>
				<Menu.Item key="setting">
					<Link to={`/site/${siteId}/setting`}>
						<Icon type="setting" />
						<span>Cài đặt</span>
					</Link>
				</Menu.Item>
			</Menu>
			{
				me.email && <div className="sidebar-avatar layout-flex">
					<Popover>
						<Avatar size={collapsed ? 64 : 30} icon="user" />
						{
							!collapsed && <p className="sidebar-avatar__text">
								<b>Tài khoản</b><br/>
								{me.email}
							</p>
						}
					</Popover>
				</div>
			}
		</div>
		</Sider>		
	}
}

export default connect(state => ({
	menuKey: state.layout.menuKey,
	me: state.layout.me
}))(withRouter(Sidebar))