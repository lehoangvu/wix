import React from "react";
import {connect} from "react-redux";
import { Button } from "antd";

import List from "./List";
import AddModal from "./AddModal";

import {setMenuActive, setHeaderAdditional} from '@/models/layout';

import api from '@/utils/api';

class Page extends React.Component {
	page = 1;
	limit = 10;
	state = {
		data: [],
		total: 0,
		fetching: false,
		addModalVisible: false
	};
	onClickAdd = () => {
		this.setState({
			addModalVisible: true
		});
	};
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

	componentDidMount() {
		this.props.dispatch(setHeaderAdditional(this.getHeaderAdditional()))
		this.props.dispatch(setMenuActive('page'))
		this.fetchData()
	}
	
	componentWillUnmount() {
		this.props.dispatch(setHeaderAdditional(null))
	}

	getHeaderAdditional = () => {
		return <React.Fragment>
			<Button icon="plus" type="primary" onClick={this.onClickAdd}>
				Tạo trang
			</Button>
		</React.Fragment>
	}

	componentDidUpdate(prevProps) {
		if(prevProps.params.siteId !== this.props.params.siteId) {
			this.page = 1;
			this.fetchData()
		}
	}

	fetchData = () => {
		this.setState({
			fetching: true
		})
		const {siteId} = this.props.router.params
		api({
			url: `/api/page?limit=${this.limit}&page=${this.page}&siteId=${siteId}`
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

	render() {
		let { fetching, data, addModalVisible, total } = this.state;
		return (
			<>

				<List onChange={this.onListChange} pagination={{
          current: this.page,
          hideOnSinglePage: true,
          pageSize: this.limit,
          total
        }}  loading={fetching} data={data} />

				<AddModal key={Math.random()} onSuccess={this.onAddSuccess} onClose={this.onCloseAddModal} visible={addModalVisible} />
			</>
		);
	}
}

export default connect()(Page)
