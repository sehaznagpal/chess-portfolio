export default function CheckerBg({ children }) {
  return (
    <div className="checker-bg" style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
}
