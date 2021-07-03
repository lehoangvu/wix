import React from 'react';
import { Link } from 'react-router';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import api from '@/utils/api';
import auth from '@/utils/auth';
import Welcome from "@/components/Welcome";

class LoginForm extends React.Component {
  handleSubmit = e => {
    e.preventDefault();
    const { setFields } = this.props.form
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        api({
        	url: '/api/token',
        	method: 'POST',
        	data: {
        		...values
        	}
        }).then((data) => {
        		if(data.token) {
        			auth.set(data.token)
        			this.props.router.replace('/')
        		}

        }).catch(error => {
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

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
    	<Welcome>
			<div className="login-wrap">
				<h2>Đăng nhập</h2>
			<Form onSubmit={this.handleSubmit} className="login-form">
				<Form.Item>
				{getFieldDecorator('email', {
					rules: [{ required: true, message: 'Email' }],
				})(
					<Input
					prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
					placeholder="Email"
					/>,
				)}
				</Form.Item>
				<Form.Item>
				{getFieldDecorator('password', {
					rules: [{ required: true, message: 'Mật khẩu' }],
				})(
					<Input
					prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
					type="password"
					placeholder="Mật khẩu"
					/>,
				)}
				</Form.Item>
				<Form.Item>
				
				<Button type="primary" htmlType="submit" className="login-form-button" block>
					Đăng nhập!
				</Button>
				<Link to="/auth/signup">
					<Button type="link" block>
					Đăng ký tài khoản!
					</Button>
				</Link>
				<Link to="/auth/signup">
					<Button type="link" block>
					Quên mật khẩu
					</Button>
				</Link>
				</Form.Item>
			</Form>
		</div>
	</Welcome>
    );
  }
}

const WrappedLoginForm = Form.create({ name: 'app_login' })(LoginForm);

export default WrappedLoginForm
