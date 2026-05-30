import React from 'react';

interface HeatmapProps {
  data: { dow: string, hour: string, count: number }[];
}

const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const hours = Array.from({ length: 24 }, (_, i) => i);

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getCount = (dow: number, hour: number) => {
    const entry = data.find(d => parseInt(d.dow) === dow && parseInt(d.hour) === hour);
    return entry ? entry.count : 0;
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #333' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '20px', display: 'block', letterSpacing: '2px' }}>// ACTIVITY_HEATMAP_24H</span>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: '4px', marginBottom: '10px' }}>
            <div />
            {hours.map(h => (
              <div key={h} style={{ fontSize: '0.6rem', textAlign: 'center', opacity: 0.5 }}>{h}h</div>
            ))}
          </div>
          {days.map((day, dIdx) => (
            <div key={day} style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: '4px', marginBottom: '4px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>{day}</div>
              {hours.map(h => {
                const count = getCount(dIdx, h);
                const opacity = count > 0 ? 0.2 + (count / maxCount) * 0.8 : 0.05;
                return (
                  <div 
                    key={h} 
                    title={`${day} ${h}:00 - ${count} hits`}
                    style={{ 
                      aspectRatio: '1', 
                      background: count > 0 ? '#fff' : '#222', 
                      opacity,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }} 
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
