import { Table, Button, Tag, Modal, Input } from 'antd';
import { useEffect, useState } from 'react';
import { getApplications } from '@/services/th05';

export default () => {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    getApplications().then(setData);
  }, []);

  const log = (action: string, note: string) => {
    setHistory([...history, {
      time: new Date().toLocaleString(),
      action,
      note
    }]);
  };

  const approve = (ids: number[]) => {
    setData(data.map(i =>
      ids.includes(i.id) ? { ...i, status: 'Approved' } : i
    ));
    log('Approved', '');
  };

  const reject = (id: number) => {
    let reason = '';

    Modal.confirm({
      title: 'Nhập lý do',
      content: <Input onChange={e => reason = e.target.value} />,
      onOk: () => {
        if (!reason) return Promise.reject();

        setData(data.map(i =>
          i.id === id ? { ...i, status: 'Rejected', note: reason } : i
        ));

        log('Rejected', reason);
      }
    });
  };

  return (
    <>
      <Button onClick={() => approve(selected)}>
        Duyệt {selected.length}
      </Button>

      <Table
        rowKey="id"
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (k) => setSelected(k as number[])
        }}
        dataSource={data}
        columns={[
          { title: 'Tên', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (s) => (
              <Tag color={
                s === 'Approved' ? 'green' :
                s === 'Rejected' ? 'red' : 'orange'
              }>
                {s}
              </Tag>
            )
          },
          {
            title: 'Action',
            render: (_, r) => (
              <>
                <Button onClick={() => approve([r.id])}>Duyệt</Button>
                <Button danger onClick={() => reject(r.id)}>Từ chối</Button>
              </>
            )
          }
        ]}
      />
    </>
  );
};