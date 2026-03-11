import React, { useState } from 'react';
import { Button, Card, List, Typography, Row, Col } from 'antd';

type Choice = 'Kéo' | 'Búa' | 'Bao';

interface HistoryItem {
  player: Choice;
  computer: Choice;
  result: string;
}

const choices: Choice[] = ['Kéo', 'Búa', 'Bao'];

const getComputerChoice = (): Choice => {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
};

const getResult = (player: Choice, computer: Choice) => {
  if (player === computer) return 'Hòa';

  if (
    (player === 'Kéo' && computer === 'Bao') ||
    (player === 'Bao' && computer === 'Búa') ||
    (player === 'Búa' && computer === 'Kéo')
  ) {
    return 'Thắng';
  }

  return 'Thua';
};

const OanTuTi: React.FC = () => {
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 });

  const playGame = (playerChoice: Choice) => {
    const computerChoice = getComputerChoice();
    const gameResult = getResult(playerChoice, computerChoice);

    setResult(
      `Bạn chọn ${playerChoice} - Máy chọn ${computerChoice} → ${gameResult}`,
    );

    const newHistory = {
      player: playerChoice,
      computer: computerChoice,
      result: gameResult,
    };

    setHistory([newHistory, ...history]);

    if (gameResult === 'Thắng') {
      setScore({ ...score, win: score.win + 1 });
    } else if (gameResult === 'Thua') {
      setScore({ ...score, lose: score.lose + 1 });
    } else {
      setScore({ ...score, draw: score.draw + 1 });
    }
  };

  return (
    <Card title="🎮 Trò chơi Oẳn Tù Tì">
      <Row gutter={16}>
        <Col span={12}>
          <Typography.Title level={4}>Chọn của bạn</Typography.Title>

          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={() => playGame('Kéo')}
          >
            ✌️ Kéo
          </Button>

          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={() => playGame('Búa')}
          >
            ✊ Búa
          </Button>

          <Button type="primary" onClick={() => playGame('Bao')}>
            ✋ Bao
          </Button>

          <Typography.Title level={5} style={{ marginTop: 20 }}>
            {result}
          </Typography.Title>

          <Card style={{ marginTop: 20 }}>
            <p>🏆 Thắng: {score.win}</p>
            <p>❌ Thua: {score.lose}</p>
            <p>🤝 Hòa: {score.draw}</p>
          </Card>
        </Col>

        <Col span={12}>
          <Typography.Title level={4}>Lịch sử trận đấu</Typography.Title>

          <List
            bordered
            dataSource={history}
            renderItem={(item) => (
              <List.Item>
                Bạn: {item.player} | Máy: {item.computer} | Kết quả:{' '}
                {item.result}
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default OanTuTi;