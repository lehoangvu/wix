import React from 'react';
import { Modal, Button, Form, Input, Switch, notification } from 'antd';
import api from '@/utils/api';
import {withRouter} from 'react-router';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

class AddModal extends React.Component {
  state = {
    saving: false
  }
  handleOk = e => {
    e.preventDefault();
    const { onSuccess } = this.props
    const { setFields } = this.props.form
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({
          saving: true
        })
        api({
          url: '/api/page',
          method: 'PUT',
          data: {
            siteId: this.props.router.params.siteId,
            ...values
          }
        }).then((data) => {
            if(data.success) {
              onSuccess()
            } else {
              this.setState({
                saving: false
              })
              notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Vui lòng thử lại'
              })
            }
        }).catch(error => {
          this.setState({
            saving: false
          })
          const {errors} = error.response.data
          if(errors) {
            errors.map(error => {
              let obj = {}
              obj[error.field] = {
                value: values[error.field],
                errors: [new Error(error.message)]
              };
              setFields(obj);
            })
          }
        })

      }
    }); 
  };

  handleCancel = e => {
    this.props.onClose()
  };

  render() {
    const {saving} = this.state
    const {visible, form} = this.props
    const { getFieldDecorator } = form
    return <Modal
      visible={visible}
      title="Tạo trang"
      onOk={this.handleOk}
      okButtonProps={{loading: saving}}
      okText={"Lưu"}
      cancelText={"Hủy"}
      onCancel={this.handleCancel}
    >
    <Form {...formItemLayout}>
      <Form.Item label="Tiêu đề">
        {getFieldDecorator('title', {
          rules: [{ required: true, message: 'Vui lòng nhập tiêu đề' }]
        })(
          <Input />,
        )}
      </Form.Item>
      <Form.Item label="Đường dẫn">
        {getFieldDecorator('path', {
          rules: [{ required: true, message: 'Vui lòng nhập đường dẫn' }],
        })(
          <Input />,
        )}
      </Form.Item>
    </Form>
    </Modal>
  }
}

export default Form.create({ name: 'page_create' })(withRouter(AddModal))
