import whiteSide from '../assets/illustrations/loading-white-side.svg';
import blackSide from '../assets/illustrations/loading-black-side.svg';

const checkerStripStyle = {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  height: 'clamp(28px, 5vh, 48px)',
  backgroundColor: '#1e1e1e',
  backgroundImage: 'repeating-conic-gradient(#1e1e1e 0% 25%, #f5f5f5 0% 50%)',
  backgroundSize: 'clamp(22px, 3vw, 40px) clamp(22px, 3vw, 40px)',
  zIndex: 1,
};

export default function LoadingScreen({ onEnter }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#161616',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Black-pieces chariot, bottom left, tilted, sitting into the strip */}
      <img
        src={blackSide}
        alt=""
        style={{
          position: 'absolute', bottom: 'clamp(-10px, 1vh, 24px)', left: 'clamp(-40px, -3vw, 10px)',
          width: 'clamp(340px, 46vw, 620px)',
          height: 'auto',
          transform: 'rotate(15.39deg)',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />

      {/* White-pieces chariot, bottom right, tilted, sitting into the strip */}
      <img
        src={whiteSide}
        alt=""
        style={{
          position: 'absolute', bottom: 'clamp(-10px, 1vh, 24px)', right: 'clamp(-30px, -2vw, 10px)',
          width: 'clamp(300px, 40vw, 540px)',
          height: 'auto',
          transform: 'rotate(26.5deg)',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />

      {/* Horizontal checker strip along the very bottom */}
      <div style={checkerStripStyle} />

      {/* Title, single line — "Game of" filled, "Chess" outlined */}
      <div style={{
        position: 'absolute', top: 'clamp(60px, 23vh, 210px)', left: 'clamp(20px, 8.75vw, 130px)',
        zIndex: 2,
        display: 'flex', alignItems: 'baseline', gap: 'clamp(8px, 1.2vw, 20px)',
        whiteSpace: 'nowrap',
      }}>
        <p style={{
          fontFamily: 'Atelier, sans-serif',
          fontSize: 'clamp(30px, 9vw, 150px)',
          lineHeight: 0.8,
          margin: 0,
          letterSpacing: '-0.02em',
          color: '#f5f5f5',
        }}>
          Game of
        </p>
        <p style={{
          fontFamily: 'Atelier, sans-serif',
          fontSize: 'clamp(30px, 9vw, 150px)',
          lineHeight: 0.8,
          margin: 0,
          letterSpacing: '-0.02em',
          color: '#121212',
          WebkitTextStroke: 'clamp(1px, 0.18vw, 2.5px) #f5f5f5',
        }}>
          Chess
        </p>
      </div>

      {/* Checkmate button, centered directly under the title */}
      <button
        onClick={onEnter}
        style={{
          position: 'absolute', top: 'clamp(120px, 40vh, 400px)', left: '50%', transform: 'translateX(-50%)',
          background: '#4b4b4b',
          border: '2px solid #f5f5f5',
          boxShadow: '3px 4px 0 rgba(0,0,0,0.4)',
          padding: 'clamp(8px, 1.3vw, 12px) clamp(14px, 2vw, 18px)',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        <span style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 'clamp(13px, 2.2vw, 30px)',
          color: '#f5f5f5',
          whiteSpace: 'nowrap',
        }}>
          CHECKMATE IS COMING
        </span>
      </button>
    </div>
  );
}
