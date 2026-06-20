export default function SettingsPanel({ showLabels, showGuide, onToggleLabels, onToggleGuide, onClose }) {
  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
  };
  const checkStyle = (checked) => ({
    width: 26, height: 26, border: '2px solid #f5f5f5',
    background: checked ? '#f5f5f5' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0, borderRadius: 0,
  });
  const labelStyle = {
    fontFamily: 'Poppins, sans-serif', fontSize: 18, color: '#f5f5f5', cursor: 'pointer',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
        padding: '70px 20px 0',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(18,18,18,0.9)',
          backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)',
          border: '2px solid rgba(255,255,255,0.35)',
          borderRadius: 14,
          padding: '12px 20px',
          width: 'min(300px, 100%)',
          color: '#f5f5f5',
        }}
      >
        <div style={rowStyle}>
          <div style={checkStyle(showLabels)} onClick={onToggleLabels}>
            {showLabels && <span style={{ color: '#121212', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={labelStyle} onClick={onToggleLabels}>Chess Board Labels</span>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.15)' }} />
        <div style={rowStyle}>
          <div style={checkStyle(showGuide)} onClick={onToggleGuide}>
            {showGuide && <span style={{ color: '#121212', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={labelStyle} onClick={onToggleGuide}>Move Guide</span>
        </div>
      </div>
    </div>
  );
}
