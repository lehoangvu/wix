import React from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import api from '@/utils/api';
import SettingForm from './SettingForm'
import Domain from './Domain'
import {setMenuActive} from '@/models/layout';

import { Tabs, Row, Col } from 'antd';

const { TabPane } = Tabs;


class Setting extends React.Component {
	state = {
		tab: "common"
	}
  componentDidMount() {
    this.props.dispatch(setMenuActive('setting'))
  }
  onChangeTab = key => {
  	this.setState({
  		tab: key
  	})
  }
  render() {
    return (
      <Row>
        <Col span={4}>
        </Col>
        <Col span={16}>
      	<Tabs defaultActiveKey="common" onChange={this.onChangeTab}>
  		    <TabPane tab="Cài đặt chung" key="common">
      			<SettingForm />
  		    </TabPane>
  		    <TabPane tab="Tên miền" key="domain">
  		      <Domain />
  		    </TabPane>
  		  </Tabs>
        </Col>
        <Col span={4}>
        </Col>
      </Row>
    );
  }
}

export default connect()(Setting)
