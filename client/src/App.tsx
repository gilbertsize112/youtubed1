import { useState, useEffect } from 'react';

type DownloadStage = 'connecting' | 'fetching' | 'quality' | 'starting' | 'downloading' | 'complete' | null;

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [error, setError] = useState(false);
  const [currentStage, setCurrentStage] = useState<DownloadStage>(null);
  const [progress, setProgress] = useState(0);

  const stages = [
    { id: 'connecting', label: 'Connecting to YouTube', emoji: '🔗' },
    { id: 'fetching', label: 'Fetching video info', emoji: '📡' },
    { id: 'quality', label: 'Getting best quality stream', emoji: '⚙️' },
    { id: 'starting', label: 'Starting download', emoji: '🚀' },
    { id: 'downloading', label: 'Downloading content', emoji: '📥' },
    { id: 'complete', label: 'Download complete', emoji: '✨' }
  ];

  const handleDownload = () => {
    if (!url) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }
    
    setLoading(true);
    setShowStatus(true);
    setCurrentStage('connecting');
    setProgress(0);

    // Simulate stage progression
    const stageTimings = [
      { stage: 'connecting' as DownloadStage, delay: 500, progress: 15 },
      { stage: 'fetching' as DownloadStage, delay: 2000, progress: 30 },
      { stage: 'quality' as DownloadStage, delay: 4000, progress: 50 },
      { stage: 'starting' as DownloadStage, delay: 6000, progress: 70 },
      { stage: 'downloading' as DownloadStage, delay: 8000, progress: 90 }
    ];

    stageTimings.forEach(({ stage, delay, progress: prog }) => {
      setTimeout(() => {
        setCurrentStage(stage);
        setProgress(prog);
      }, delay);
    });

    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal 
      ? 'http://localhost:4000/api/download' 
      : '/api/download';

    // Start the actual download after a brief delay
    setTimeout(() => {
      window.location.href = `${baseUrl}?url=${encodeURIComponent(url)}`;
      
      // Clear loading state after download starts
      setTimeout(() => {
        setLoading(false);
        setShowStatus(false);
        setCurrentStage(null);
        setProgress(0);
      }, 5000);
    }, 500);
  };

  const getStageIndex = () => {
    return stages.findIndex(s => s.id === currentStage);
  };

  const currentStageIndex = getStageIndex();

  return (
    <div style={styles.container}>
      {/* Animated Mesh Background */}
      <div className="mesh-gradient"></div>

      {/* Beautified Error Transition (Replaces the Alert) */}
      {error && (
        <div className="status-toast error-shake" style={{ backgroundColor: '#ff3333' }}>
          <span style={{marginRight: '10px'}}>⚠️</span>
          Please paste a YouTube link first!
        </div>
      )}

      {/* Enhanced Loading Modal with Robotic Design */}
      {loading && showStatus && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContainer}>
            {/* Robotic Header */}
            <div style={styles.roboticHeader}>
              <div style={styles.scanlineEffect}></div>
              <h2 style={styles.loadingTitle}>DOWNLOAD INITIATED</h2>
              <div style={styles.statusBar}>
                <div style={{...styles.statusBarFill, width: `${progress}%`}}></div>
              </div>
              <p style={styles.percentageText}>{progress}%</p>
            </div>

            {/* Stage Indicators */}
            <div style={styles.stagesContainer}>
              {stages.map((stage, index) => (
                <div key={stage.id} style={styles.stageWrapper}>
                  <div 
                    style={{
                      ...styles.stageIndicator,
                      ...(index < currentStageIndex 
                        ? styles.stageComplete 
                        : index === currentStageIndex 
                        ? styles.stageActive 
                        : styles.stagePending)
                    }}
                  >
                    <div style={styles.stageContent}>
                      <span style={styles.stageEmoji}>{stage.emoji}</span>
                      <div style={styles.stageLine}></div>
                    </div>
                  </div>
                  <p style={{
                    ...styles.stageLabel,
                    ...(index === currentStageIndex && styles.stageLabelActive)
                  }}>
                    {stage.label}
                  </p>
                  {index < stages.length - 1 && (
                    <div style={{
                      ...styles.stageConnector,
                      ...(index < currentStageIndex && styles.stageConnectorComplete)
                    }}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Real-time Status Message */}
            <div style={styles.statusMessage}>
              <div style={styles.pulsingDot}></div>
              <p style={styles.statusText}>
                {currentStage === 'connecting' && 'Establishing secure connection to YouTube servers...'}
                {currentStage === 'fetching' && 'Analyzing video metadata and available formats...'}
                {currentStage === 'quality' && 'Scanning for optimal quality streams and codecs...'}
                {currentStage === 'starting' && 'Initializing download pipeline and buffer allocation...'}
                {currentStage === 'downloading' && 'Streaming video data and processing packets...'}
              </p>
            </div>

            {/* Robotic Footer */}
            <div style={styles.roboticFooter}>
              <div style={styles.footerBorder}></div>
              <p style={styles.footerText}>🔴 ACTIVE • PROCESSING VIDEO DATA</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        style={{
          ...styles.card,
          transform: loading ? 'scale(0.95)' : 'scale(1)',
          filter: loading ? 'brightness(0.6)' : 'brightness(1)',
          pointerEvents: loading ? 'none' : 'auto',
          opacity: loading ? 0.7 : 1
        }} 
        className="main-card"
      >
        <div style={styles.logoSection}>
          <div className="icon-wrapper">
             <span className="floating-icon" style={styles.icon}>🎬</span>
          </div>
          <h1 style={styles.title}>Stream<span style={{color: '#FF0000'}}>Fetch</span></h1>
        </div>
        
        <p style={styles.subtitle}>Premium YouTube Content Extractor</p>

        <div style={styles.inputGroup}>
          <input 
            type="text" 
            inputMode="url"
            placeholder="Paste YouTube link..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={styles.input}
            className="neon-input"
            disabled={loading}
          />
          <button 
            onClick={handleDownload}
            disabled={loading}
            style={{
              ...styles.button,
              backgroundColor: loading ? '#222' : '#FF0000',
              opacity: loading ? 0.5 : 1,
              boxShadow: loading ? 'none' : '0 10px 30px rgba(255, 0, 0, 0.3)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            className="shiny-button"
          >
            {loading ? (
              <span className="loader-text">⚡ Processing...</span>
            ) : (
              'Download MP4'
            )}
          </button>
        </div>

        {/* Dynamic Download Note */}
        {!loading && (
          <p style={styles.downloadNote}>
            Fetching high-quality streams from YouTube servers...
          </p>
        )}

        <div style={styles.footer}>
          <span>4K High Fidelity</span>
          <span style={{margin: '0 8px'}}>•</span>
          <span>No Limits</span>
        </div>

        <div style={styles.branding}>
           <p>© 2026 StreamFetch | All Rights Reserved</p>
           <p style={styles.author}>Built with 🔥 by <span style={{color: '#fff', fontWeight: 'bold'}}>Gilbert Favour James</span></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    margin: 0,
    padding: '20px',
    boxSizing: 'border-box' as const,
    overflowX: 'hidden' as const,
    position: 'relative' as const,
  },
  loadingOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease-in',
    backdropFilter: 'blur(5px)',
  },
  loadingContainer: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    border: '2px solid #FF0000',
    borderRadius: '10px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 0 60px rgba(255, 0, 0, 0.3), inset 0 0 20px rgba(255, 0, 0, 0.1)',
    animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  roboticHeader: {
    marginBottom: '30px',
    position: 'relative' as const,
  },
  scanlineEffect: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #FF0000, transparent)',
    animation: 'scanline 2s infinite',
  },
  loadingTitle: {
    color: '#FF0000',
    fontSize: '20px',
    fontWeight: '900',
    margin: '10px 0 20px 0',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    textShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
  },
  statusBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden' as const,
    border: '1px solid rgba(255, 0, 0, 0.3)',
    marginBottom: '10px',
  },
  statusBarFill: {
    height: '100%',
    backgroundColor: '#FF0000',
    transition: 'width 0.5s ease',
    boxShadow: '0 0 10px rgba(255, 0, 0, 0.8)',
  },
  percentageText: {
    color: '#aaa',
    fontSize: '12px',
    textAlign: 'right' as const,
    letterSpacing: '1px',
    margin: '8px 0 0 0',
  },
  stagesContainer: {
    margin: '30px 0',
    padding: '20px',
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    border: '1px solid rgba(255, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  stageWrapper: {
    marginBottom: '20px',
    position: 'relative' as const,
  },
  stageIndicator: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '6px',
    transition: 'all 0.4s ease',
    border: '1px solid rgba(255, 0, 0, 0.2)',
  },
  stageComplete: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
  },
  stageActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    border: '1px solid rgba(255, 0, 0, 0.6)',
    boxShadow: '0 0 15px rgba(255, 0, 0, 0.4), inset 0 0 10px rgba(255, 0, 0, 0.1)',
  },
  stagePending: {
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    border: '1px solid rgba(100, 100, 100, 0.2)',
    opacity: 0.6,
  },
  stageContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stageEmoji: {
    fontSize: '20px',
    minWidth: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, rgba(255, 0, 0, 0.5), transparent)',
  },
  stageLabel: {
    color: '#888',
    fontSize: '13px',
    margin: '8px 0 0 36px',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
  },
  stageLabelActive: {
    color: '#FF0000',
    fontWeight: '600' as const,
  },
  stageConnector: {
    position: 'absolute' as const,
    left: '32px',
    top: '48px',
    width: '2px',
    height: '20px',
    background: 'linear-gradient(180deg, rgba(100, 100, 100, 0.3), transparent)',
    transition: 'background 0.4s ease',
  },
  stageConnectorComplete: {
    background: 'linear-gradient(180deg, rgba(0, 255, 0, 0.5), transparent)',
  },
  statusMessage: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 0, 0, 0.2)',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  pulsingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#FF0000',
    borderRadius: '50%',
    marginTop: '5px',
    minWidth: '8px',
    animation: 'pulse 1.5s infinite',
    boxShadow: '0 0 8px rgba(255, 0, 0, 0.8)',
  },
  statusText: {
    color: '#aaa',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
    letterSpacing: '0.5px',
  },
  roboticFooter: {
    borderTop: '2px solid rgba(255, 0, 0, 0.3)',
    paddingTop: '15px',
  },
  footerBorder: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #FF0000, transparent)',
    marginBottom: '10px',
  },
  footerText: {
    color: '#FF0000',
    fontSize: '11px',
    textAlign: 'center' as const,
    letterSpacing: '2px',
    margin: 0,
    textTransform: 'uppercase' as const,
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'rgba(15, 15, 15, 0.75)',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    padding: 'clamp(30px, 8vw, 60px) clamp(20px, 5vw, 40px)',
    borderRadius: '35px',
    boxShadow: '0 25px 80px -12px rgba(255, 0, 0, 0.15)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center' as const,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    zIndex: 10,
    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
  },
  icon: { fontSize: 'clamp(40px, 10vw, 60px)' },
  title: {
    fontSize: 'clamp(32px, 8vw, 48px)',
    fontWeight: '900',
    color: '#fff',
    margin: 0,
    letterSpacing: '-2px',
    textTransform: 'uppercase' as const,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    marginBottom: '35px',
    fontWeight: 400,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  input: {
    padding: '18px',
    borderRadius: '16px',
    border: '2px solid rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '18px',
    borderRadius: '16px',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '800',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  downloadNote: {
    color: '#FF0000',
    fontSize: '13px',
    marginTop: '15px',
    animation: 'pulse 1.5s infinite',
    fontWeight: '500'
  },
  footer: {
    marginTop: '40px',
    fontSize: '11px',
    color: '#555',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  branding: {
    marginTop: '40px',
    paddingTop: '25px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '12px',
    color: '#444',
  },
  author: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#666'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scanline {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .error-shake {
    animation: shake 0.5s ease-in-out !important;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  .status-toast {
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 25px;
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid rgba(0, 255, 0, 0.3);
    color: #00ff00;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    display: flex;
    align-items: center;
    animation: slideDown 0.3s ease-out;
    box-shadow: 0 4px 20px rgba(0, 255, 0, 0.2);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translate(-50%, -20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
}

export default App;