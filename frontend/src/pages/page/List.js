import React from 'react';
import moment from 'moment';
import {Link} from 'react-router';
import { Table } from 'antd';
import {withRouter} from 'react-router';

class BannerList extends React.Component {
  render() {
    const {siteId} = this.props.router.params
    const columns = [
      {
        title: 'Path',
        dataIndex: 'path',
        render: (text, record) => <Link to={`/site/${siteId}/page/${record.id}`}>{text}</Link>
      },
      {
        title: 'Tiêu đề',
        className: 'column-money',
        dataIndex: 'title',
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
    const {data, loading, pagination, onChange} = this.props
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
