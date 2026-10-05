import { useState } from 'react';
import { Box, Play, Pause, Truck, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { HUBS, useGameStore } from '../../store/useGameStore';
import { useEmpireStore } from '../../store/useEmpireStore';
import { toggleSound, isSoundEnabled } from '../../utils/audio';

const SEASON_BADGES = [
  { label: '🌸 Xuân Tết · Cao Điểm', color: '#dc2626' },
  { label: '☀️ Hè Nông Sản · Giải Cứu', color: '#ea580c' },
  { label: '🍂 Thu Xuất Khẩu · Cảng Biển', color: '#0284c7' },
  { label: '❄️ Đông Nghĩa Tình · Cứu Trợ', color: '#059669' },
];

export const TopNavBar = () => {
  const unlocked = useEmpireStore(s => s.unlockedHubs);
  const chapter = useEmpireStore(s => s.chapter);
  const [sound, setSound] = useState(isSoundEnabled());
  const { currentHub, setHub, gameSpeed, setGameSpeed, spawnTruck, count } = useGameStore(useShallow(s => ({
    currentHub: s.currentHub, setHub: s.setHub, gameSpeed: s.gameSpeed,
    setGameSpeed: s.setGameSpeed, spawnTruck: s.spawnTruck, count: s.trucks.length,
  })));

  const seasonIndex = Math.floor(Math.max(0, chapter - 5) / 3) % 4;
  const season = SEASON_BADGES[seasonIndex];

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSound(newState);
  };

  return (
    <header className="game-toolbar">
      <div className="brand">
        <span className="brand-icon"><Box size={22} /></span>
        <div>
          Đại Việt
          <small>ĐẾ CHẾ LOGISTICS QUỐC DÂN</small>
        </div>
      </div>

      <div className="season-pill" style={{ borderColor: season.color }}>
        <Sparkles size={14} style={{ color: season.color }} />
        <span>{chapter < 5 ? `Chương ${chapter + 1} · Khởi Nghiệp` : season.label}</span>
      </div>

      <select aria-label="Chọn trung tâm" value={currentHub} onChange={e => setHub(e.target.value)} className="hub-select">
        {HUBS.map(hub => (
          <option key={hub.id} value={hub.id} disabled={!unlocked.includes(hub.id)}>
            {hub.name}{!unlocked.includes(hub.id) ? ' · Chưa mở' : ''}
          </option>
        ))}
      </select>

      <div className="toolbar-actions">
        <button
          className="sound-toggle-btn"
          onClick={handleSoundToggle}
          title={sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
          aria-label={sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button className="primary-button" disabled={count >= 8} onClick={() => spawnTruck()} title="Gọi xe đến kho">
          <Truck size={16} />
          <span>Gọi xe</span>
        </button>

        <div className="speed-controls">
          <button aria-label={gameSpeed === 0 ? 'Tiếp tục' : 'Tạm dừng'} onClick={() => setGameSpeed(gameSpeed === 0 ? 1 : 0)}>
            {gameSpeed === 0 ? <Play size={15} /> : <Pause size={15} />}
          </button>
          {[1, 2].map(speed => (
            <button key={speed} className={gameSpeed === speed ? 'active' : ''} onClick={() => setGameSpeed(speed)}>
              {speed}×
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
