import React from 'react'
import Browser from './Browser'
import Tab from './Tab'
import View from './View'
import './style.scss'
import _ from 'lodash'
import api from '@/utils/api'
import {Tooltip, Icon, notification} from 'antd'

export default class FileEditor extends React.Component {
	state = {
		files: {},
		selected: null,
		selectedStack: []
	}
	initState  = () => {
		const { files } = this.props;
		let fileObjs = {};
		files.forEach(file => {
			fileObjs[file.id] = {
				content: null,
				removeable: false,
				changed: false,
				loaded: false,
				opened: false,
				saving: false,
				renaming: false,
				...file
			}
		})
		this.setState({
			files: fileObjs
		})
	}
	constructor(p) {
		super(p)
	}
	componentDidUpdate(prevProps) {

		if(!_.isEqual(this.props.files, prevProps.files)) {
			this.initState()
		}
	}
	componentDidMount() {
		this.initState()
	}
	onSelectFile = id => {
		if(!id) {
			return this.setState({selected: null})
		}
		let {files, selectedStack} = this.state
		files[id].opened = true

		if(selectedStack[selectedStack.length - 1] !== id) {
			selectedStack.push(id)
		}

		this.setState({
			selected: id,
			files,
			selectedStack
		})
		if(!files[id].loaded) {
			this.loadContent(id)
		}
	}
	onUnselectFile = (id, behavior = 'close') => {
		let {selectedStack, files} = this.state;
		let file = files[id];
		if(file.changed && behavior === 'close') {
			if(!confirm("Nội dung đã thay đổi, bạn có chắc muốn đóng file này ?")) {
				return;
			}
		}
		
		selectedStack = selectedStack.filter(_id => _id !== id)
		
		if(behavior === 'delete') {
			delete files[id]
		} else {
			files[id] = {
				...files[id],
				loaded: false,
				opened: false,
				changed: false
			}
		}
		this.setState({
			selectedStack,
			files,
			selected: selectedStack.length > 0 ? selectedStack[selectedStack.length - 1] : null
		})
	}
	loadContent = id => {
		api({
			url: '/api/file',
			params: {
				id: id
			}
		}).then(file => {
			const {files} = this.state;
			files[id] = {
				...files[id],
				content: file.content,
				removeable: file.removeable,
				loaded: true
			}
			this.setState({files})
		})
	}


	onAddFile = file => {
		let {files} = this.state
		files[file.id] = file
		this.setState({
			files
		})
	}

	onChangeFileContent = content => {
		const {files, selected} = this.state
		if(selected) {
			files[selected].content = content
			files[selected].changed = true
		}
		this.setState({
			files
		})
	}
	
	onDeleteFile = id => {
		if(confirm('Bạn có chắc muốn xóa file này ?')) {
			api({
				url: '/api/file',
				method: 'DELETE',
				params: {
					id
				}
			}).then(() => {
				this.onUnselectFile(id, 'delete')
			}).catch(e => {
				this.props.pushToNotification({
					type: 'error',
					text: 'Có lỗi khi xóa file, hãy thử lại!'
				})
			}) 
		}
	}

	onSaveFile = id => {
		const {files} = this.state
		const {pageId} = this.props;
		let {content, name} = files[id]

		files[id].saving = true;
		this.setState({
			files
		})
		api({
			url: '/api/file',
			method: 'POST',
			data: {
				file_id: id,
				page_id: pageId,
				name,
				content
			}
		}).then(file => {
			this.props.pushToNotification({
				type: 'success',
        text: 'Đã lưu!'
      });
      files[id].changed = false;
      files[id].saving = false;
      this.setState({
      	files
      })
		}).catch(e => {
			this.props.pushToNotification({
				type: 'error',	
			  text: 'Có lỗi khi lưu file, hãy thử lại!'
			});
			files[id].saving = false;
			this.setState({
      	files
      })
		})
	}

	onRenameFile = (id, name) => {
		const {files} = this.state
		const {pageId} = this.props;
		// let {} = files[id]

		files[id].renaming = true;
		this.setState({
			files
		})
		api({
			url: '/api/file',
			method: 'POST',
			data: {
				file_id: id,
				page_id: pageId,
				name
			}
		}).then(file => {
			this.props.pushToNotification({
				type: 'success',
        text: 'Đã lưu!'
      });
      files[id].renaming = false;
      files[id].name = name;
      this.setState({
      	files
      })
		}).catch(e => {
			this.props.pushToNotification({
				type: 'error',	
			  text: 'Có lỗi khi đổi tên file, hãy thử lại!'
			});
		})
	}

	render() {
		const {files, selected} = this.state;
		const {onLoad, pageId} = this.props;
		return <div className="fe-root">
			<div className="fe-browser">
				<Browser
					onAddFile={this.onAddFile}
					selected={selected}
					files={files}
					onSelectFile={this.onSelectFile}
					pageId={pageId}/>
			</div>
			<div className="fe-right">
				<Tab
					selected={selected}
					onSelectFile={this.onSelectFile}
					onUnselectFile={this.onUnselectFile}
					files={{...files}}/>
				{selected && <View 
					onDeleteFile={this.onDeleteFile}
					onSaveFile={this.onSaveFile}
					onRenameFile={this.onRenameFile}
					onUnselectFile={this.onUnselectFile}
					onChange={this.onChangeFileContent}
					file={{...files[selected]}} />}
				{!selected && <div className="fe-right__no-file-selected">
					<Icon type="info-circle" theme="filled" /> Chọn file hoặc thêm file để chỉnh sửa
				</div>}
			</div>
		</div>
	}
}