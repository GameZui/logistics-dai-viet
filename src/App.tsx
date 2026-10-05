import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas } from './components/canvas/GameCanvas';
import { TopNavBar } from './components/ui/TopNavBar';
import { TopKpiCards } from './components/ui/TopKpiCards';
import { ShipmentTimeline } from './components/ui/ShipmentTimeline';
import { FleetDockTable } from './components/ui/FleetDockTable';
import { InspectorDrawer } from './components/ui/InspectorDrawer';
import { CameraControlsWidget } from './components/ui/CameraControlsWidget';
import { EmpirePanel } from './components/ui/EmpirePanel';
import { VietnamMapPanel } from './components/ui/VietnamMapPanel';
import { useEmpireStore, CAMPAIGN, storyChapter } from './store/useEmpireStore';
import { saveGame, restoreGame } from './utils/saveGame';

export default function App() {
  const [showPanels, setShowPanels] = useState(false);
  const [economical, setEconomical] = useState(false);
  const [showEmpire, setShowEmpire] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const restored = useRef(false);
  const notice = useEmpireStore(s => s.notice);
  const chapter = useEmpireStore(s => s.chapter);
  useEffect(() => {
    if (!restored.current) { restoreGame(); restored.current = true; }
    const interval = window.setInterval(saveGame, 30000);
    window.addEventListener('pagehide', saveGame);
    return () => { window.clearInterval(interval); window.removeEventListener('pagehide', saveGame); };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => useEmpireStore.setState({ notice: '' }), 7000);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-[#e8f1fa] font-sans antialiased text-slate-800">
      {/* 3D Viewport Layer */}
      <GameCanvas economical={economical} />

      {/* Top HUD Layer */}
      <TopNavBar />
      <TopKpiCards />

      {/* Floating Camera Controls */}
      <CameraControlsWidget />

      {/* National Vietnam map & inter-city fleet tracker */}
      {showMap && <VietnamMapPanel onClose={() => setShowMap(false)} />}

      {/* Right Side Inspector Drawer */}
      {!showEmpire && <InspectorDrawer />}
      {showEmpire && <EmpirePanel onClose={() => setShowEmpire(false)} />}
      <button className="mission-ribbon" onClick={() => setShowEmpire(true)}><span>CHƯƠNG {chapter + 1}</span>{storyChapter(chapter).title}<b>↗</b></button>
      {notice && <div className="game-toast" role="status">{notice}</div>}

      {/* Bottom HUD Layer */}
      {showPanels && !showEmpire && <ShipmentTimeline />}
      {showPanels && !showEmpire && <FleetDockTable />}
      <div className="game-footer">
      <button onClick={() => setShowPanels(!showPanels)} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
        {showPanels ? 'Ẩn bảng điều hành' : 'Mở bảng điều hành'}
      </button>
      <button onClick={() => setShowEmpire(!showEmpire)} className="primary-button">{showEmpire ? 'Đóng quản lý' : 'Quản lý doanh nghiệp'}</button>
      <button onClick={() => setShowMap(!showMap)} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">🗺 {showMap ? 'Đóng bản đồ' : 'Bản đồ Việt Nam'}</button>
      <button onClick={() => setEconomical(!economical)} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
        {economical ? '⚡ Ưu tiên hiệu năng' : '◉ Đồ họa tiêu chuẩn'}
      </button>
      </div>
    </main>
  );
}
