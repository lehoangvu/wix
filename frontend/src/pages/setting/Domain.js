import React from "react";
import moment from "moment";
import { Table, Input, Button, Modal, notification } from "antd";
import { withRouter } from "react-router";
import { setHeaderAdditional } from "@/models/layout";
import { connect } from "react-redux";
import api from "@/utils/api";
import {get} from 'lodash';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

class DomainForm extends React.Component {
  state = {
    data: [],
    modalBehavior: "add",
    selectedRowKeys: [],
    addModalVisible: false,
    createLoading: false,
    loading: false,
    formError: [],
  };

  componentDidMount() {
    this.fetch();
  }

  onAddDomainPress = () => {
    this.onToggleModal();
    this.setState({
      modalBehavior: "add",
    });
  };

  onRemoveSelected = () => {
    const {selectedRowKeys, data} = this.state;
    Modal.confirm({
      title: `Bạn có chắc muốn xóa ${selectedRowKeys.length} tên miền`,
      content: 'Trang của bạn vẫn sẽ hoạt động trên tên miền mặc định',
      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk: () => {
        const { siteId } = this.props.router.params;
        let ids = [];
        data.forEach((item, index) => {
          if(selectedRowKeys.includes(index)) {
            ids.push(item.id)
          }
        })

        api({
          url: `/api/site/config/${siteId}/domain`,
          method: 'DELETE',
          data: { ids }
        }).then(this.fetch)
        .catch(error => {
          notification.error({
            message: 'Xóa tên miền',
            description: get(error, 'response.error', 'Có lỗi xảy ra!')
          })
        })
      },
      onCancel() {
        
      },
    });
  };

  onOpenHelpModal = () => {};

  getActionButton = () => {
    const { selectedRowKeys } = this.state;
    const buttons = [];
    if (selectedRowKeys.length > 0) {
      buttons.push(
        <Button onClick={this.onRemoveSelected} size="small" type="danger">
          Xóa
        </Button>
      );
    }

    buttons.push(
      <Button type="primary" size="small" onClick={this.onAddDomainPress}>
        Tạo mới
      </Button>
    );
    buttons.push(
      <Button type="default" size="small" onClick={this.onOpenHelpModal}>
        Hướng dẫn
      </Button>
    );

    return buttons;
  };

  fetch = () => {
    const { siteId } = this.props.router.params;
    this.setState({
      loading: true
    })
    api({
      url: `/api/site/config/${siteId}/domain`,
    }).then(data => {
      this.setState({data: get(data, 'data', []), loading: false})
    });
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  handleSubmit = (e) => {
    const { siteId } = this.props.router.params;
    const { newDomain } = this.state;
    e.preventDefault();
    this.setState({
      createLoading: true,
      formError: [],
    });
    api({
      url: `/api/site/config/${siteId}/domain`,
      method: "PUT",
      data: {
        domain: newDomain,
      },
    })
      .then((data) => {
        this.setState({
          createLoading: false,
          addModalVisible: false,
          newDomain: '',
        });
        this.fetch(); //reset page to 1
      })
      .catch((error) => {
        const { errors } = error.response.data;
        if (errors) {
          this.setState({
            createLoading: false,
            formError: errors,
          });
        }
      });
  };

  onChangeDomain = (e) => {
    this.setState({
      newDomain: e.target.value
    })
  };

  onToggleModal = () => {
    this.setState({ addModalVisible: !this.state.addModalVisible });
  };

  render() {
    const {
      selectedRowKeys,
      addModalVisible,
      modalBehavior,
      createLoading,
      formError,
      newDomain,
      loading,
      data,
    } = this.state;
    const columns = [
      {
        title: "Tên miền",
        dataIndex: "domain",
        key: "domain",
        render: (text) => (
          <a href="javascript:">
            {text}
          </a>
        ),
      },
      {
        title: "Tạo lúc",
        dataIndex: "created_at",
        key: "created_at",
        render: (text) => moment(text).format("hh:mm DD/MM/YYYY"),
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <>
        <div className="btn-row btn-row__right">{this.getActionButton()}</div>
        <Table
          loading={loading}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          pagination={false}
        ></Table>
        <Modal footer={null} visible={addModalVisible} onCancel={this.onToggleModal}>
          <h1 style={{ fontSize: 30 }}>Thêm tên miền</h1>
          <form onSubmit={this.handleSubmit}>
            <Input
              size="large"
              value={newDomain}
              placeholder="Nhập tên miền"
              onChange={this.onChangeDomain}
            />
            {formError.length > 0 && (
              <div className="error-message">
                {formError.map((err) => (
                  <p>{err.message}</p>
                ))}
              </div>
            )}
            <p>Ví dụ: webcuatoi.com</p>
            <div className="btn-row btn-row__right">
              <Button type="default" onClick={this.onToggleModal}>Hủy</Button>
              <Button
                htmlType="submit"
                icon="plus"
                type="primary"
                loading={createLoading}
              >
                {modalBehavior === "add" && `Tạo mới`}
              </Button>
            </div>
          </form>
        </Modal>
      </>
    );
  }
}

export default connect()(withRouter(DomainForm));
