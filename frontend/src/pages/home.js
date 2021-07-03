import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { Card, Icon, Input, Button, Modal } from "antd";
import { fetchSite } from "@/models/home";
import api from "@/utils/api";

class Home extends React.Component {
  state = {
    addFormVisible: false,
    createLoading: false,
    addFormError: [],
  };
  page = 1;
  componentDidMount() {
    this.fetch();
  }
  fetch = (page = false) => {
    this.page = page ? page : this.page;
    this.props.dispatch(fetchSite(this.page));
  };
  toggleCreate = (e) => {
    this.setState({
      addFormVisible: !this.state.addFormVisible,
      addFormError: [],
      createLoading: false,
    });
  };
  onChangeDomain = (e) => {
    this.newDomainName = e.target.value;
  };
  onSubmit = (e) => {
    e.preventDefault();
    this.setState({
      createLoading: true,
    });
    api({
      url: "/api/site",
      method: "PUT",
      data: {
        domain: this.newDomainName,
      },
    })
      .then((data) => {
        this.setState({
          createLoading: false,
          addFormVisible: false,
        });
        this.fetch(1); //reset page to 1
      })
      .catch((error) => {
        const { errors } = error.response.data;
        if (errors) {
          this.setState({
            createLoading: false,
            addFormError: errors,
          });
        }
      });
  };
  render() {
    const { sites, siteLoading } = this.props;
    const { addFormVisible, createLoading, addFormError } = this.state;

    return (
      <React.Fragment>
        <div className="home-container">
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <div
              className="site-card site-card--add"
              onClick={this.toggleCreate}
            >
              <React.Fragment>
                <Icon
                  type={siteLoading ? 'loading' : 'plus'}
                  style={{
                    fontSize: 34,
                    color: "#2196F3",
                  }}
                />
                <div>{siteLoading ? 'Đang tải' : 'Tạo mới'}</div>
              </React.Fragment>
            </div>
            
            {sites.map((site) => {
              return (
                <Link to={`/site/${site.id}/page`} className="site-card">
                  {site.domain}
                </Link>
              );
            })}
          </div>
        </div>
        <Modal
          footer={null}
          visible={addFormVisible}
          onCancel={this.toggleCreate}
        >
          <h1 style={{ fontSize: 30 }}>Tạo mới một website</h1>
          <form onSubmit={this.onSubmit}>
            <Input
              size="large"
              placeholder="Nhập domain"
              onChange={this.onChangeDomain}
              addonBefore="http://"
              addonAfter=".mywish.com"
            />
            {addFormError.length > 0 && (
              <div className="error-message">
                {addFormError.map((err) => (
                  <p>{err.message}</p>
                ))}
              </div>
            )}
            <p>Ví dụ: webcuatoi</p>
            <Button
              htmlType="submit"
              icon="plus"
              type="primary"
              loading={createLoading}
              className="mt-10"
            >
              Tạo mới
            </Button>
          </form>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect((state) => {
  return {
    sites: state.home.sites,
    total: state.home.total,
    siteLoading: state.home.siteLoading,
  };
})(Home);
