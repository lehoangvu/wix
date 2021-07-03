import React from "react";
import {connect} from "react-redux";
import { Button, notification, Icon } from "antd";

import Editor from '@/components/FileEditor';

import {setHeaderAdditional, setMenuActive} from '@/models/layout';

import api from '@/utils/api';

import generate from 'nanoid/generate';

class EditPage extends React.Component {
	state = {
		files: [],
		status: [],
		puplishing: false
	};

	componentDidMount = () => {
		this.props.dispatch(setMenuActive('page'))
		this.fetchFiles()
	}

	componentDidUpdate = () => {
		this.props.dispatch(setHeaderAdditional(this.getHeaderAdditional()))
	}

	componentWillUnmount() {
		this.props.dispatch(setHeaderAdditional(null))
	}

	openPreviewWindow = () => {
		const {sites} = this.props
		const {siteId, pageId} = this.props.router.params

		let site = sites.find(site => site.id === site_id)
		window.open(`/site/${siteId}/page/${pageId}/preview`)
	}

	getHeaderAdditional = () => {
		const {puplishing, status} = this.state;
		return <div className="text-right">
			<span className="notifications">
				{status.map(item => {
					return <span className={`type-${item.type}`}>
						{item.type == 'error' && <Icon type="exclamation-circle" />}
						{item.type == 'success' && <Icon type="check" />}
						{' ' + item.text}
					</span>
				})}
			</span>
			<Button icon="eye" onClick={this.openPreviewWindow} className="mr-10" type="primary">Xem trước</Button>
			<Button icon="file" className="mr-10" type="primary" onClick={this.onPublish} loading={puplishing} disabled={puplishing}>Xuất bản</Button>
			<Button icon="delete" type="danger">Xóa</Button>
		</div>
	}

	onPublish = () => {
		this.setState({puplishing: true})
		const {siteId, pageId} = this.props.router.params
		api({
			url: `/api/page/${pageId}/release`,
			params: {
				siteId
			}
		}).then(page => {
			this.setState({puplishing: false})
	    this.pushToNotification({text: 'Xuất bản thành công', type: 'success'})
		}).catch(e => {
			this.setState({puplishing: false})
			this.pushToNotification({text: 'Xuất bản lỗi, hãy thử lại!', type: 'error'})
		}) 
	}

	pushToNotification = item => {
		let {status} = this.state
		status.unshift(item)
		if(this.statusClearTimer) {
			clearInterval(this.statusClearTimer)
		}
		this.statusClearTimer = setInterval(() => {
			let {status} = this.state
			this.setState({
				status: status.splice(0, status.length - 1)
			})
		}, 2000)
		this.setState({
			status: status.splice(0, 3) // max 3 item
		})
	}

	saveToPreview = () => {
		this.setState({previewAlready: true})
		const {siteId, pageId} = this.props.router.params
		api({
			url: `/api/page/${pageId}/release`,
			params: {
				siteId,
				isPreview: 1
			}
		}).then(page => {
			this.setState({previewAlready: false})
	    this.pushToNotification({text: 'Sẵn sàng để xem trước', type: 'success'})
		}).catch(e => {
			this.setState({previewAlready: false})
			this.pushToNotification({text: 'Lỗi khi chuẩn bị bản xem trước', type: 'error'})
		}) 
	}

	fetchFiles = () => {
		const {siteId, pageId} = this.props.router.params
		api({
			url: '/api/page/'+pageId,
			params: {
				siteId
			}
		}).then(page => {
			this.setState({
				files: page.files,
				path: page.path,
				site_id: page.site_id
			})
		})
	}

	render() {
		const {siteId, pageId} = this.props.router.params
		const {files} = this.state
		return (
			<>
				<Editor pushToNotification={this.pushToNotification} saveToPreview={this.saveToPreview} files={files} pageId={pageId} />
			</>
		);
	}
}

export default connect(state => ({
	sites: state.home.sites
}))(EditPage)