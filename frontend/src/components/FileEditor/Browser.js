import React from 'react'
import {Tooltip, Icon, notification} from 'antd'
import _ from 'lodash'
import api from '@/utils/api';
const ICONS = {
	js: <span className="fe-browser__icon fe-browser__icon--js">js</span>,
	css: <span className="fe-browser__icon fe-browser__icon--css">css</span>,
	html: <span className="fe-browser__icon fe-browser__icon--html">html</span>,
	json: <span className="fe-browser__icon fe-browser__icon--json">json</span>
}
export default class FileEditor extends React.Component {
	state = {
		newFileVisible: false,
		creating: false
	}
	getIcon = name => {
		let slugs = name.split('.');
		return ICONS[slugs[slugs.length - 1]] || ICONS_UNDEFINED;
	}	

	onAddFileClick = () => {
		this.setState({
			newFileVisible: true
		})
	}


	onAddMediaClick = () => {
		this.setState({
			newFileVisible: true
		})
	}

	onNewFileCancel = () => {
		this.setState({
			newFileVisible: false
		})
	}

	onNewFileKeyPress = e => {
		if(e.charCode === 13) {
			const {pageId, onAddFile} = this.props;
			this.setState({
				creating: true
			})
			api({
				url: '/api/file',
				method: 'put',
				data: {
					name: e.target.value,
					content: '',
					page_id: pageId
				}
			}).then(data => {
				onAddFile({name: data.name, id: data.id, content: data.content, loaded: true})
				this.setState({newFileVisible: false, creating: false})
			}).catch(error => {
				this.setState({newFileVisible: false, creating: false})
				try{
					const {errors} = error.response.data
	      	if(errors) {
	      		errors.map(error => {
	      			notification.error({
	      				message: 'Lỗi tạo file',
				        description: error.message
				      });
	      		})
	      	}
				}catch(e) {
					notification.error({
    				message: 'Lỗi tạo file',	
		        description: 'Có lỗi sảy ra!'
		      });	
				}
			})
		}
	}

	render() {
		const {newFileVisible, newFileError, creating} = this.state;
		const {files, selected, onSelectFile} = this.props;

		return <React.Fragment>
			<div className="fe-browser__actions">
				<div className="fe-browser__actions__title">
					Files
				</div>
				<div className="fe-browser__actions__right">
					<Tooltip placement="topLeft" title={'Thêm file'}>
						<span className="fe-browser__actions__item" onClick={this.onAddFileClick}>
		        	<Icon type="file-add" theme="filled" />
		        </span>
		      </Tooltip>
					{/*<Tooltip placement="topLeft" title={'Thêm media'}>
						<span className="fe-browser__actions__item" onClick={this.onAddFileClick}>
		        	<Icon type="picture" theme="filled" />
		        </span>
		      </Tooltip>*/}
				</div>
			</div>
			<div className="fe-browser__files">
				{
					newFileVisible && <div className="fe-browser__create">
						<div className="fe-browser__create__input">
							<input autoFocus onBlur={this.onNewFileCancel} onKeyPress={this.onNewFileKeyPress} placeholder="Nhập tên file" />{'  '}{creating && <Icon type="loading" style={{fontSize: 12}} />}
						</div>
					</div>
				}
				{
					Object.keys(files).map(id => {
						let selectClass = selected === id ? 'fe-browser__file--selected' : ''
						return <div
							key={id}
							className={`fe-browser__file ${selectClass}`}
							onClick={() => {onSelectFile(id)}}
						>
						{this.getIcon(files[id].name)}
						{files[id].name}
						</div>
					})
				}
				{
					Object.keys(files).length == 0 && <p><Icon type="loading" style={{fontSize: 12}} /> Đang tải file</p>
				}
			</div>
		</React.Fragment>
	}
}