import { useEffect, useState } from 'react';
import { Button, InputNumber, Card, message } from 'antd';

export default function GuessNumber() {
  const [secret, setSecret] = useState<number>(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [turns, setTurns] = useState<number>(10);
  const [finished, setFinished] = useState<boolean>(false);

  // Sinh số ngẫu nhiên khi bắt đầu
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const random = Math.floor(Math.random() * 100) + 1;
    setSecret(random);
    setTurns(10);
    setGuess(null);
    setFinished(false);
    message.info('🎯 Trò chơi bắt đầu! Hãy đoán số từ 1 đến 100');
  };

  const submitGuess = () => {
    if (guess === null) return;

    if (guess === secret) {
      message.success('🎉 Chúc mừng! Bạn đã đoán đúng!');
      setFinished(true);
      return;
    }

    const remain = turns - 1;
    setTurns(remain);

    if (guess < secret) {
      message.warning('⬆️ Bạn đoán quá thấp!');
    } else {
      message.warning('⬇️ Bạn đoán quá cao!');
    }

    if (remain === 0) {
      message.error(`❌ Bạn đã hết lượt! Số đúng là ${secret}`);
      setFinished(true);
    }
  };

  return (
    <Card title="🎮 Bài 1: Trò chơi đoán số" style={{ maxWidth: 400 }}>
      <p>🔢 Hãy đoán một số từ <b>1 đến 100</b></p>
      <p>⏳ Số lượt còn lại: <b>{turns}</b></p>

      <InputNumber
        min={1}
        max={100}
        value={guess}
        disabled={finished}
        onChange={setGuess}
        style={{ width: '100%', marginBottom: 12 }}
      />

      <Button
        type="primary"
        block
        disabled={finished}
        onClick={submitGuess}
      >
        Đoán
      </Button>

      <Button
        style={{ marginTop: 12 }}
        block
        onClick={resetGame}
      >
        Chơi lại
      </Button>
    </Card>
  );
}