import React from 'react';
import moment from 'moment';
import {Link} from 'react-router';
import { Table, Input } from 'antd';
import {withRouter} from 'react-router';

class BannerList extends React.Component {
  onSelect = e => {
    e.target.setSelectionRange(0, e.target.value.length)
  }
  render() {
    const {siteId} = this.props.router.params
    const columns = [
      {
        title: 'Hình',
        width: 300,
        render: (text, record) => <img style={{maxWidth: 260, maxHeight: 150}} src={record.url}  />
      },
      {
        title: 'Url',
        dataIndex: 'url',
        render: (text) => <Input.TextArea onClick={this.onSelect} class="form-control" value={text} />
      },
      {
        title: 'Thông tin',
        render: (text, record, index) => {
          return <p>
            Ngày tạo: {moment(record.createdAt).format('hh:mm:ss DD/MM/YYYY')}<br/>
          </p>
        }
      },
    ];
    const {data, onChange, pagination, loading} = this.props
    return <div>
      <Table
        pagination={pagination}
        onChange={onChange}
        loading={loading}
        columns={columns}
        dataSource={data}
        bordered
      />
    </div>
  }
}

export default withRouter(BannerList)
