import { Table, Button, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { getClubs } from '@/services/th05';
import ClubForm from './Form';

export default () => {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const fetch = async () => {
    const res = await getClubs();
    setData(res);
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Thêm CLB
      </Button>

      <Table rowKey="id" dataSource={data} columns={[
        { title: 'Tên CLB', dataIndex: 'name' },
        { title: 'Chủ nhiệm', dataIndex: 'leader' },
        {
          title: 'Action',
          render: (_, r) => (
            <Button danger onClick={() => {
              Modal.confirm({
                title: 'Xóa?',
                onOk: () => setData(data.filter(i => i.id !== r.id))
              });
            }}>
              Xóa
            </Button>
          )
        }
      ]} />

      <ClubForm open={open} onCancel={() => setOpen(false)} reload={fetch} />
    </>
  );
};