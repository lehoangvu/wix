import React from "react";
import {connect} from "react-redux";
import { Button } from "antd";
import {setMenuActive, setHeaderAdditional} from '@/models/layout';
import List from "./List";
// import AddModal from "./AddModal";
import {notification} from 'antd'
import api from '@/utils/api';

class Media extends React.Component {
  limit = 20
  page = 1;
  state = {
    fileKey: 0,
    data: [],
    total: 0,
    fetching: false,
    addModalVisible: false
  };
  constructor(p) {
    super(p)
    this.fileInput = React.createRef();
  }
  onClickAdd = () => {
    this.fileInput.current.click()
  };
  onInputFileChange = async e => {
    try {
      const {siteId} = this.props.router.params

      let uploadPrs = []
      for(let i = 0; i < e.target.files.length; i++) {
        let form = new FormData()
        form.append('file', e.target.files[i])
        uploadPrs.push(api({
          url: `${APP_CONFIGS.media_api}/file/upload`,
          method: "post",
          data: form,
          headers: {'Content-Type': 'multipart/form-data' }
        }))
      }

      let datas = await Promise.all(uploadPrs)
      console.log(datas)

      for(let i = 0; i < datas.length; i++) {
        if(!datas[i].success) {
          notification.error({
            message: 'Upload media',
            description: datas[i].message
          })
        }
        let saveFile = await api({
          url: '/api/media',
          method: "put",
          data: {
            url: datas[i].imageUrl,
            siteId
          }
        })
        if(saveFile.success) {
          notification.success({
            message: 'Upload media',
            description: 'Upload file thành công'
          })
        }
      }
    } catch(e) {
      console.log(e)
      notification.error({
        message: 'Upload media',
        description: 'Có lỗi khi upload file, hãy thử lại!'
      })
    } finally {
      let {fileKey} = this.state
      this.setState({
        fileKey: fileKey+1
      })
    }
  }
  onCloseAddModal = () => {
    this.setState({
      addModalVisible: false
    })
  }
  onAddSuccess = () => {
    this.setState({
      addModalVisible: false
    })
    this.page = 1;
    this.fetchData()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.params.siteId !== this.props.params.siteId) {
      this.page = 1;
      this.fetchData()
    }
  }


  getHeaderAdditional = () => {
    return <React.Fragment>
      <Button icon="plus" type="primary" onClick={this.onClickAdd}>
        Thêm file
      </Button>
    </React.Fragment>
  }


  fetchData = () => {
    this.setState({
      fetching: true
    })
    const {siteId} = this.props.router.params
    api({
      url: `/api/media?page=${this.page}&limit=${this.limit}&siteId=${siteId}`
    }).then(data => {
      this.setState({
        data: data.data,
        total: data.total,
        fetching: false
      })
    }).catch(error => {
      this.setState({
        fetching: false
      })
    })
  }

  onListChange = pagination => {
    const {current} = pagination
    this.page = current
    this.fetchData()
  }

  componentDidMount() {
    this.props.dispatch(setMenuActive('media'))
    this.props.dispatch(setHeaderAdditional(this.getHeaderAdditional()))
    this.fetchData()
  }

  render() {
    let { total, fileKey, fetching, data, addModalVisible } = this.state;
    return (
      <>

        <List loading={fetching} onChange={this.onListChange} pagination={{
          current: this.page,
          hideOnSinglePage: true,
          pageSize: this.limit,
          total
        }} data={data} />
        <div style={{display: 'none'}}>
          <input key={fileKey} ref={this.fileInput} type="file" name="file[]" multiple onChange={this.onInputFileChange} />
        </div>
        {/*<AddModal key={Math.random()} onSuccess={this.onAddSuccess} onClose={this.onCloseAddModal} visible={addModalVisible} />*/}
      </>
    );
  }
}
export default connect()(Media)