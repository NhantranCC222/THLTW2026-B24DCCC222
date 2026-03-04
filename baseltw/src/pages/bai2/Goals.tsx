import { useEffect, useState } from 'react';
import { Button, InputNumber, Card, Statistic } from 'antd';

const LOG_KEY = 'bai2_logs';
const GOAL_KEY = 'bai2_goal';

export default function Goals() {
  const [goal, setGoal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    setTotal(logs.reduce((s: number, l: any) => s + l.duration, 0));
    setGoal(Number(localStorage.getItem(GOAL_KEY)) || 0);
  }, []);

  const saveGoal = (value: number | null) => {
    if (!value) return;
    setGoal(value);
    localStorage.setItem(GOAL_KEY, value.toString());
  };

  return (
    <div>
      <h2>🎯 Mục tiêu học tập tháng</h2>

      <Card style={{ width: 300 }}>
        <Statistic title="Tổng phút đã học" value={total} />
        <Statistic title="Mục tiêu tháng" value={goal} />

        <InputNumber
          placeholder="Nhập mục tiêu (phút)"
          style={{ marginTop: 16, width: '100%' }}
          onChange={saveGoal}
        />

        <p style={{ marginTop: 16 }}>
          {total >= goal && goal > 0 ? '✅ Đã đạt mục tiêu' : '❌ Chưa đạt mục tiêu'}
        </p>
      </Card>
    </div>
  );
}