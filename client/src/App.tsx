import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = () => {
    if (!url) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }
    
    setLoading(true);
    setShowStatus(true);
    
    /**
     * SMART URL SELECTION:
     * If the browser URL contains 'localhost', it uses your local server (Port 4000).
     * Otherwise, it uses the Vercel API path.
     */
    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal 
      ? 'http://localhost:4000/download' 
      : '/api/download'; // Vercel handles this via the rewrite in vercel.json

    window.location.href = `${baseUrl}?url=${encodeURIComponent(url)}`;
    
    setTimeout(() => {
      setLoading(false);
      setShowStatus(false);
    }, 8000);
  };

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

      {/* Beautified Status Popup */}
      {showStatus && (
        <div className="status-toast">
          <span style={{marginRight: '10px'}}>🚀</span>
          Your download is starting! Please wait a moment...
        </div>
      )}
      
      <div 
        style={{
          ...styles.card,
          transform: loading ? 'scale(0.98)' : 'scale(1)',
          filter: loading ? 'brightness(0.9)' : 'brightness(1)'
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
          />
          <button 
            onClick={handleDownload}
            disabled={loading}
            style={{
              ...styles.button,
              backgroundColor: loading ? '#222' : '#FF0000',
              opacity: loading ? 0.8 : 1,
              boxShadow: loading ? 'none' : '0 10px 30px rgba(255, 0, 0, 0.3)'
            }}
            className="shiny-button"
          >
            {loading ? (
              <span className="loader-text">⚡ Extracting...</span>
            ) : (
              'Download MP4'
            )}
          </button>
        </div>

        {/* Dynamic Download Note */}
        {loading && (
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

export default App;