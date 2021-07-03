import React from "react";
import { Link } from "react-router";
import { Form, Icon, Input, Button, Checkbox } from "antd";
import api from "@/utils/api";
import auth from "@/utils/auth";
import Welcome from "@/components/Welcome";

class RegisterForm extends React.Component {
  state = {
    errors: null,
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const { setFields } = this.props.form;
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        api({
          url: "/api/token",
          method: "PUT",
          data: {
            ...values,
          },
        })
          .then((data) => {
            if (data.token) {
              auth.set(data.token);
              this.props.router.replace("/");
            }
          })
          .catch((error) => {
            const { errors } = error.response.data;
            if (errors) {
              errors.map((error) => {
                let obj = {};
                obj[error.field] = {
                  value: values[error.field],
                  errors: [new Error(error.message)],
                };
                setFields(obj);
              });
            }
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { errors } = this.state;
    return (
      <Welcome>
        <div className="signup-wrap">
          <h2>Đăng ký</h2>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <Form.Item>
              {getFieldDecorator("username", {
                rules: [
                  { required: true, message: "Vui lòng nhập tên đăng nhập" },
                ],
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="Tên đăng nhập"
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("email", {
                rules: [{ required: true, message: "Vui lòng nhập tên email" }],
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="Email"
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("password", {
                rules: [
                  { required: true, message: "Vui lòng nhập tên mật khẩu" },
                ],
              })(
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  type="password"
                  placeholder="Mật khẩu"
                />
              )}
            </Form.Item>
            {}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                block
              >
                Đăng ký
              </Button>{" "}
              <Link to="/auth/login">
                <Button
                  type="link"
                  htmlType="submit"
                  className="login-form-button"
                  block
                >
                  Đăng nhập tài khoản
                </Button>{" "}
              </Link>
            </Form.Item>
          </Form>
        </div>
      </Welcome>
    );
  }
}

const WrappedRegisterForm = Form.create({ name: "app_register" })(RegisterForm);

export default WrappedRegisterForm;
