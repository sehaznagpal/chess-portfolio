import whiteSide from '../assets/illustrations/loading-white-side.png';
import blackSide from '../assets/illustrations/loading-black-side.png';

export default function LoadingScreen({ onEnter }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#b7d1ea',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Diagonal checker stripe, corner to corner — behind everything else */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        left: '50%',
        width: 'clamp(90px, 14vw, 200px)',
        height: '220%',
        transform: 'translateX(-50%) rotate(-18deg)',
        backgroundColor: '#1e1e1e',
        backgroundImage: 'repeating-conic-gradient(#1e1e1e 0% 25%, #f5f5f5 0% 50%)',
        backgroundSize: 'clamp(22px, 3.2vw, 44px) clamp(22px, 3.2vw, 44px)',
        zIndex: 0,
      }} />

      {/* White-pieces chariot, top right corner — most of it kept on-screen */}
      <img
        src={whiteSide}
        alt=""
        style={{
          position: 'absolute', top: 'clamp(-50px, -6vw, -24px)', right: 'clamp(-60px, -8vw, -24px)',
          width: 'clamp(252px, 41.4vw, 558px)',
          height: 'auto',
          objectFit: 'contain',
          objectPosition: 'top right',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 1,
        }}
      />

      {/* Black-pieces chariot, lower left */}
      <img
        src={blackSide}
        alt=""
        style={{
          position: 'absolute', bottom: 0, left: 0,
          width: 'clamp(252px, 41.4vw, 558px)',
          height: 'auto',
          objectFit: 'contain',
          objectPosition: 'bottom left',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 1,
        }}
      />

      {/* Title block, top-left — kept as one tight unit */}
      <div style={{
        position: 'absolute', top: 'clamp(24px, 6vh, 64px)', left: 'clamp(20px, 5vw, 56px)',
        zIndex: 2,
        display: 'flex', flexDirection: 'column',
      }}>
        <p style={{
          fontFamily: 'Atelier, sans-serif',
          fontSize: 'clamp(40px, 9vw, 132px)',
          lineHeight: 0.8,
          margin: 0,
          color: '#f5f5f5',
          WebkitTextStroke: 'clamp(1px, 0.18vw, 2.5px) #121212',
        }}>
          Games
        </p>
        <p style={{
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(16px, 3.9vw, 56px)',
          lineHeight: 0.8,
          color: '#121212',
          margin: 0,
          alignSelf: 'center',
        }}>
          OF
        </p>
        <p style={{
          fontFamily: 'Atelier, sans-serif',
          fontSize: 'clamp(54px, 12.5vw, 180px)',
          lineHeight: 0.8,
          margin: 'clamp(-22px, -3.4vw, -10px) 0 0',
          color: '#121212',
          WebkitTextStroke: 'clamp(1px, 0.18vw, 2.5px) #f5f5f5',
        }}>
          Chess
        </p>
      </div>

      {/* Checkmate button, bottom right — this is how the loading screen advances */}
      <button
        onClick={onEnter}
        style={{
          position: 'absolute', bottom: 'clamp(20px, 4vh, 40px)', right: 'clamp(20px, 5vw, 56px)',
          background: '#383838',
          border: 'none',
          padding: 'clamp(8px, 1.3vw, 12px) clamp(14px, 2vw, 18px)',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        <span style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 'clamp(13px, 2vw, 28px)',
          color: '#f5f5f5',
          whiteSpace: 'nowrap',
        }}>
          CHECKMATE IS COMING
        </span>
      </button>
    </div>
  );
}
