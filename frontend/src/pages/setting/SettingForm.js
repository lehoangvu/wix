import React from 'react';
import { Link } from 'react-router';
import { Form, Icon, Input, Col, Row, Button, notification } from 'antd';
import api from '@/utils/api';
import auth from '@/utils/auth';
import {withRouter} from 'react-router'

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

class SettingForm extends React.Component {
  componentDidMount() {
    this.fetch()
  }
  fetch = () => {
    const { setFields } = this.props.form
    const {siteId} = this.props.router.params;
    api({
      url: '/api/site/config/' + siteId
    }).then(data => {
      const { config } = data
      Object.keys(config).map(field => {
        setFields({[field]:{value: config[field]}})
      })
    }).catch((e) => {
      console.log(e)
      notification.error({
        message: 'Có lỗi xảy ra',
        description: 'Vui lòng reload'
      });
    })
  }
  handleSubmit = e => {
    e.preventDefault();
    const { setFields } = this.props.form
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        api({
        	url: '/api/site/config',
        	method: 'POST',
        	data: {
        		...values
        	}
        }).then((data) => {
          
        }).catch(error => {
        	const {errors} = error.response.data
        	if(errors) {
        		notification.error({
              message: 'Có lỗi xảy ra',
              description: <div>
                {errors.map(item => <p>{item}</p>)}
              </div>
            });
        	}
        })

      }
    });	
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
    	<div>
	      <Form {...formItemLayout} onSubmit={this.handleSubmit}>
	        <Form.Item label="API KEY">
	          {getFieldDecorator('api_key', {
	            rules: [{ required: true, message: 'Vui lòng nhập API KEY' }],
	          })(
	            <Input />,
	          )}
	        </Form.Item>
          <Form.Item label="API PASSWORD">
            {getFieldDecorator('api_pass', {
              rules: [{ required: true, message: 'Vui lòng nhập API PASSWORD' }],
            })(
              <Input />,
            )}
          </Form.Item>
          <Form.Item label="API HOST">
            {getFieldDecorator('api_host', {
              rules: [{ required: true, message: 'Vui lòng nhập API HOST' }],
            })(
              <Input />,
            )}
          </Form.Item>
	        <Form.Item className="button-group">
            <Row>
              <Col sm={6}>
              </Col>
              <Col sm={16}>
                <Button type="danger" >
                  Reset
                </Button>
    	          <Button type="primary" htmlType="submit">
    	            Lưu cấu hình
    	          </Button>
              </Col>
            </Row>
	        </Form.Item>
	      </Form>
      </div>
    );
  }
}

const WrappedSettingForm = Form.create({ name: 'app_setting' })(SettingForm);

export default withRouter(WrappedSettingForm)
