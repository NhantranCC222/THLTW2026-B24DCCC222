import React, { useState } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Typography,
} from 'antd';
import dayjs from 'dayjs';

import EmployeeList from './components/EmployeeList';
import ServiceList from './components/ServiceList';
import AppointmentList from './components/AppointmentList';

import { useLocalStorage } from './hooks/useLocalStorage';

const { Title } = Typography;

export default function TH03() {
  const [employees, setEmployees] = useLocalStorage<any[]>('emp', []);
  const [services, setServices] = useLocalStorage<any[]>('ser', []);
  const [appointments, setAppointments] = useLocalStorage<any[]>('app', []);
  const [reviews, setReviews] = useLocalStorage<any[]>('rev', []);

  const [form, setForm] = useState<any>({});

  // ===== EMPLOYEE =====
  const addEmployee = () => {
    const name = prompt('Tên NV');
    const max = Number(prompt('Max/ngày'));
    const start = prompt('Giờ bắt đầu (09:00)');
    const end = prompt('Giờ kết thúc (17:00)');

    if (!name || isNaN(max)) return;

    setEmployees([
      ...employees,
      { id: Date.now(), name, max, start, end },
    ]);
  };

  const editEmployee = (e: any) => {
    const name = prompt('Tên', e.name);
    const max = Number(prompt('Max', e.max));
    const start = prompt('Start', e.start);
    const end = prompt('End', e.end);

    if (!name || isNaN(max)) return;

    setEmployees(
      employees.map((x) =>
        x.id === e.id ? { ...x, name, max, start, end } : x
      )
    );
  };

  const deleteEmployee = (id: number) => {
    setEmployees(employees.filter((e) => e.id !== id));
  };

  // ===== SERVICE =====
  const addService = () => {
    const name = prompt('Tên DV');
    const price = Number(prompt('Giá'));
    const duration = Number(prompt('Phút'));

    if (!name || isNaN(price) || isNaN(duration)) return;

    setServices([
      ...services,
      { id: Date.now(), name, price, duration },
    ]);
  };

  const editService = (s: any) => {
    const name = prompt('Tên', s.name);
    const price = Number(prompt('Giá', s.price));
    const duration = Number(prompt('Time', s.duration));

    if (!name || isNaN(price) || isNaN(duration)) return;

    setServices(
      services.map((x) =>
        x.id === s.id ? { ...x, name, price, duration } : x
      )
    );
  };

  const deleteService = (id: number) => {
    setServices(services.filter((s) => s.id !== id));
  };

  // ===== BOOKING =====
  const book = () => {
    const { customerName, employeeId, serviceId, date, time } = form;

    if (!customerName || !employeeId || !serviceId || !date || !time) {
      return message.error('Nhập đủ thông tin!');
    }

    const emp = employees.find((e) => e.id === employeeId);

    // check giờ làm
    if (time < emp.start || time > emp.end) {
      return message.error('Ngoài giờ làm!');
    }

    // check trùng
    const isDuplicate = appointments.some(
      (a) =>
        a.employeeId === employeeId &&
        a.date === date &&
        a.time === time &&
        a.status !== 'cancelled'
    );

    if (isDuplicate) return message.error('Trùng lịch!');

    // check max
    const count = appointments.filter(
      (a) => a.employeeId === employeeId && a.date === date
    ).length;

    if (count >= emp.max) return message.error('Full!');

    setAppointments([
      ...appointments,
      { ...form, id: Date.now(), status: 'pending' },
    ]);

    message.success('Đặt thành công!');
  };

  const updateStatus = (id: number, status: string) => {
    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, status } : a
      )
    );
  };

  // ===== REVIEW =====
  const addReview = (id: number) => {
    const rating = Number(prompt('Rating'));
    const comment = prompt('Comment') || '';
    if (isNaN(rating)) return;

    setReviews([
      ...reviews,
      { id: Date.now(), appointmentId: id, rating, comment, reply: '' },
    ]);
  };

  const replyReview = (id: number) => {
    const reply = prompt('Phản hồi');
    if (!reply) return;

    setReviews(
      reviews.map((r) =>
        r.id === id ? { ...r, reply } : r
      )
    );
  };

  const getAvg = (id: number) => {
    const list = reviews.filter((r) => {
      const a = appointments.find((ap) => ap.id === r.appointmentId);
      return a?.employeeId === id;
    });
    if (!list.length) return 0;
    return (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1);
  };

  // ===== STATS =====
  const totalToday = appointments.filter(
    (a) => a.date === dayjs().format('YYYY-MM-DD')
  ).length;

  const totalMonth = appointments.filter((a) =>
    a.date?.startsWith(dayjs().format('YYYY-MM'))
  ).length;

  const revenue = appointments.reduce((sum, a) => {
    if (a.status !== 'done') return sum;
    const s = services.find((x) => x.id === a.serviceId);
    return sum + (s?.price || 0);
  }, 0);

  return (
    <div style={{ padding: 30, background: '#f5f7fa' }}>
      <Title level={2}>📅 Quản lý đặt lịch</Title>

      <Card title="👤 Nhân viên" extra={<Button onClick={addEmployee}>+</Button>}>
        <EmployeeList
          employees={employees}
          getAvg={getAvg}
          onDelete={deleteEmployee}
          onEdit={editEmployee}
        />
      </Card>

      <Card title="🛠 Dịch vụ" style={{ marginTop: 20 }} extra={<Button onClick={addService}>+</Button>}>
        <ServiceList
          services={services}
          onDelete={deleteService}
          onEdit={editService}
        />
      </Card>

      <Card title="📌 Đặt lịch" style={{ marginTop: 20 }}>
        <Form layout="inline">
          <Input placeholder="Tên khách" onChange={(e) => setForm({ ...form, customerName: e.target.value })} />

          <Select placeholder="Nhân viên" style={{ width: 120 }} onChange={(v) => setForm({ ...form, employeeId: v })}>
            {employees.map((e) => (
              <Select.Option key={e.id} value={e.id}>
                {e.name}
              </Select.Option>
            ))}
          </Select>

          <Select placeholder="Dịch vụ" style={{ width: 120 }} onChange={(v) => setForm({ ...form, serviceId: v })}>
            {services.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>

          <DatePicker onChange={(d) => setForm({ ...form, date: d?.format('YYYY-MM-DD') })} />
          <TimePicker format="HH:mm" onChange={(t) => setForm({ ...form, time: t?.format('HH:mm') })} />

          <Button type="primary" onClick={book}>
            Đặt
          </Button>
        </Form>
      </Card>

      <Card title="📋 Lịch hẹn" style={{ marginTop: 20 }}>
        <AppointmentList
          appointments={appointments}
          updateStatus={updateStatus}
          addReview={addReview}
        />
      </Card>

      <Card title="📊 Thống kê" style={{ marginTop: 20 }}>
        <p>Hôm nay: {totalToday}</p>
        <p>Tháng này: {totalMonth}</p>
      </Card>

      <Card title="💰 Doanh thu" style={{ marginTop: 20 }}>
        <h2>{revenue.toLocaleString()} đ</h2>
      </Card>
    </div>
  );
}