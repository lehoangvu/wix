import React from 'react';
import get from 'lodash/get';

import Editor from 'react-simple-code-editor';
import { Spin, Icon, Button, Popover, Input } from 'antd';

import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

const getLang = name => {
	let langs = {
		js: 'javascript',
		css: 'css',
		html: 'html'
	};
	let defaultLang = 'html';
	let slugs = name.split('.')
	return langs[slugs[slugs.length - 1].toLowerCase()] || defaultLang
}
class View extends React.Component {
	state = {
		renameVisible: false,
		oldName: 'Nhập tên...'
	}
	
	componentDidMount() {
		
	}
  componentDidUpdate(prevProps) {
  	if(this.props.file.renaming !== prevProps.file.renaming && this.props.file.renaming === false) {
  		console.log('off')
  		this.setState({renameVisible: false})
  	}
  }

  onValueChange = content => {
  	this.props.onChange(content)
  }

  onSave = e => {
		const {file, onSaveFile} = this.props
		onSaveFile(file.id)
  }

  onDeleteFile = () => {
  	const {file, onDeleteFile} = this.props
		onDeleteFile(file.id)	
  }

	onCancel = e => {
		const {file, onUnselectFile} = this.props
		onUnselectFile(file.id)
	}

	onRename = newName => {
		
		const {file, onRenameFile} = this.props
		onRenameFile(file.id, newName)
	}

	handleVisibleChange = visible => {
		if(visible) {
			const {file} = this.props;
			this.setState({oldName: file.name})
		}
		this.setState({renameVisible: visible})
	}

	getRenameForm = () => {
		const {file} = this.props
		const {oldName} = this.state
		return <div>
			<Input.Search onChange={v => {this.setState({oldName: v.target.value})}} value={oldName} onSearch={this.onRename} enterButton="Lưu" />
		</div>
	}

  render() {
  	const {renameVisible} = this.state
  	const {file} = this.props
  	const {content, name, loaded, saving, renaming, removeable} = file
    return (
      <div className="fe-view">
      	{!loaded && <div style={{padding: 20, textAlign: 'center'}}>
      		<Spin tip="Đang tải nội dung..." indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} />
    		</div>}
	      {loaded && <>
			      <div className="fe-view__actions text-right">
		      		<Button type="primary" loading={saving} icon="save" size="small" onClick={this.onSave} className="mr-10">Lưu</Button>
			      	
			      	{ removeable != false && 
				      		<Popover
					        content={this.getRenameForm()}
					        title="Nhập tên"
					        trigger="click"
					        visible={renameVisible}
					        onVisibleChange={this.handleVisibleChange}
					      >
				      		<Button type="primary" loading={renaming} icon="font-colors" size="small" className="mr-10">Đổi tên</Button>
					      </Popover>
				    	}
			      	{ removeable != false && <Button type="danger" icon="delete" size="small" className="mr-10" onClick={this.onDeleteFile}>Xóa</Button>}
			      	<Button type="warning" icon="close" size="small" onClick={this.onCancel}>Hủy</Button>
			      </div>
			      <div className="fe-view__scroll">
				      	<Editor
				        value={content||''}
				        onValueChange={this.onValueChange}
				        highlight={code => highlight(code, languages[getLang(name)])}
				        padding={10}
				        style={{
				          fontFamily: '"Fira code", "Fira Mono", monospace',
				          fontSize: 13,
				          minHeight: '100%'
				        }}
				      />
			      </div>
		      </>
    		}
	     </div>
    );
  }
}
export default View