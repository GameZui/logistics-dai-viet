import { useState } from 'react';
import { Plus, Minus, RotateCcw, Home, Truck, Users, Factory, MapPin } from 'lucide-react';
import { CAMERA_VIEWS, requestCameraView, requestCameraZoom } from '../../utils/cameraViews';

const viewIcons: Record<string, typeof Home> = {
  overview: Home,
  sorting: Users,
  docks: Truck,
  factory: Factory,
  gate: MapPin,
};

export const CameraControlsWidget = () => {
  const [active, setActive] = useState('overview');

  const goToView = (id: string) => {
    setActive(id);
    requestCameraView(id);
  };

  return (
    <div className="camera-widget">
      <span className="camera-widget-title">GÓC NHÌN</span>
      <div className="camera-view-list">
        {CAMERA_VIEWS.map((view) => {
          const Icon = viewIcons[view.id] ?? Home;
          return (
            <button
              key={view.id}
              type="button"
              title={view.hint}
              className={active === view.id ? 'active' : ''}
              onClick={() => goToView(view.id)}
            >
              <Icon size={14} />
              {view.label}
            </button>
          );
        })}
      </div>
      <div className="camera-widget-zoom">
        <button type="button" title="Phóng to" onClick={() => requestCameraZoom('in')}>
          <Plus size={14} />
        </button>
        <button type="button" title="Thu nhỏ" onClick={() => requestCameraZoom('out')}>
          <Minus size={14} />
        </button>
        <button type="button" title="Khôi phục góc nhìn" onClick={() => goToView('overview')}>
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};
