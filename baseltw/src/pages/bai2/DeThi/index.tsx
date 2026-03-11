import React, { useState } from "react";
import { Button, InputNumber, Card, List } from "antd";

interface Question {
  id: number;
  content: string;
  difficulty: string;
}

export default () => {
  const questions: Question[] = [
    { id: 1, content: "React là gì?", difficulty: "Dễ" },
    { id: 2, content: "State là gì?", difficulty: "Dễ" },
    { id: 3, content: "Virtual DOM?", difficulty: "Trung bình" },
    { id: 4, content: "Hook hoạt động thế nào?", difficulty: "Khó" },
  ];

  const [easy, setEasy] = useState(1);
  const [medium, setMedium] = useState(1);
  const [hard, setHard] = useState(0);

  const [exam, setExam] = useState<Question[]>([]);

  const randomPick = (arr: Question[], n: number) =>
    arr.sort(() => 0.5 - Math.random()).slice(0, n);

  const generateExam = () => {
    const easyQ = randomPick(
      questions.filter((q) => q.difficulty === "Dễ"),
      easy
    );

    const mediumQ = randomPick(
      questions.filter((q) => q.difficulty === "Trung bình"),
      medium
    );

    const hardQ = randomPick(
      questions.filter((q) => q.difficulty === "Khó"),
      hard
    );

    setExam([...easyQ, ...mediumQ, ...hardQ]);
  };

  return (
    <div>
      <Card title="Cấu trúc đề thi">
        Dễ: <InputNumber value={easy} onChange={(v) => setEasy(Number(v))} />
        Trung bình:{" "}
        <InputNumber value={medium} onChange={(v) => setMedium(Number(v))} />
        Khó: <InputNumber value={hard} onChange={(v) => setHard(Number(v))} />

        <br />
        <br />

        <Button type="primary" onClick={generateExam}>
          Tạo đề
        </Button>
      </Card>

      <Card title="Đề thi">
        <List
          dataSource={exam}
          renderItem={(item) => <List.Item>{item.content}</List.Item>}
        />
      </Card>
    </div>
  );
};