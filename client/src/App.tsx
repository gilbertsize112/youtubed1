import { useState, useEffect, useCallback, memo } from 'react';

// ==========================================
// TYPES
// ==========================================
type Platform = 'youtube' | 'facebook' | 'tiktok' | null;
type DownloadStage = 'connecting' | 'fetching' | 'quality' | 'starting' | 'downloading' | 'complete' | null;

interface StageConfig {
  id: Exclude<DownloadStage, null>;
  label: string;
  emoji: string;
}

// ==========================================
// CONSTANTS
// ==========================================
const YOUTUBE_STAGES: StageConfig[] = [
  { id: 'connecting', label: 'Connecting to YouTube', emoji: '🔗' },
  { id: 'fetching', label: 'Fetching video info', emoji: '📡' },
  { id: 'quality', label: 'Getting best quality', emoji: '⚙️' },
  { id: 'starting', label: 'Starting download', emoji: '🚀' },
  { id: 'downloading', label: 'Downloading video', emoji: '📥' },
  { id: 'complete', label: 'Download complete', emoji: '✨' }
];

const FACEBOOK_STAGES: StageConfig[] = [
  { id: 'connecting', label: 'Connecting to Facebook', emoji: '🔗' },
  { id: 'fetching', label: 'Fetching video info', emoji: '📡' },
  { id: 'quality', label: 'Processing video', emoji: '⚙️' },
  { id: 'starting', label: 'Starting download', emoji: '🚀' },
  { id: 'downloading', label: 'Downloading video', emoji: '📥' },
  { id: 'complete', label: 'Download complete', emoji: '✨' }
];

const TIKTOK_STAGES: StageConfig[] = [
  { id: 'connecting', label: 'Connecting to TikTok', emoji: '🔗' },
  { id: 'fetching', label: 'Fetching video info', emoji: '📡' },
  { id: 'quality', label: 'Processing video', emoji: '⚙️' },
  { id: 'starting', label: 'Starting download', emoji: '🚀' },
  { id: 'downloading', label: 'Downloading video', emoji: '📥' },
  { id: 'complete', label: 'Download complete', emoji: '✨' }
];

const CSS_INJECTION = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  html { 
    scroll-behavior: smooth;
    overflow-y: scroll !important; 
    overflow-x: hidden;
    height: auto !important;
  }
  
  body { 
    margin: 0;
    padding: 0;
    min-height: 100vh;
    overflow-y: auto !important; 
    overflow-x: hidden;
    background: #000;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  
  #root {
    min-height: 100vh;
    overflow-y: auto !important;
    overflow-x: hidden;
  }
  
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(60px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -30px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
  @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
  @keyframes glowRed { 0%, 100% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.6), 0 0 60px rgba(255, 0, 0, 0.3); } 50% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.9), 0 0 100px rgba(255, 0, 0, 0.5); } }
  @keyframes glowBlue { 0%, 100% { box-shadow: 0 0 30px rgba(24, 119, 242, 0.6), 0 0 60px rgba(24, 119, 242, 0.3); } 50% { box-shadow: 0 0 50px rgba(24, 119, 242, 0.9), 0 0 100px rgba(24, 119, 242, 0.5); } }
  @keyframes glowPurple { 0%, 100% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(236, 72, 153, 0.3); } 50% { box-shadow: 0 0 50px rgba(236, 72, 153, 0.9), 0 0 100px rgba(236, 72, 153, 0.5); } }
  @keyframes borderRotate { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
  @keyframes particle { 0% { transform: translateY(100vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.1); } 28% { transform: scale(1); } 42% { transform: scale(1.1); } 70% { transform: scale(1); } }
  @keyframes rotate3d { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
  
  .animated-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    min-height: 100%;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a0000 25%, #000a1a 50%, #0a0a0a 75%, #1a0000 100%);
    background-size: 400% 400%;
    animation: borderRotate 15s ease infinite;
    z-index: -2;
  }
  
  .particles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
  }
  
  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 0, 0, 0.6);
    border-radius: 50%;
    animation: particle 8s linear infinite;
  }
  
  .particle:nth-child(2n) { background: rgba(24, 119, 242, 0.6); animation-delay: -2s; left: 20%; }
  .particle:nth-child(3n) { background: rgba(255, 0, 0, 0.4); animation-delay: -4s; left: 40%; }
  .particle:nth-child(4n) { background: rgba(24, 119, 242, 0.4); animation-delay: -6s; left: 60%; }
  .particle:nth-child(5n) { background: rgba(255, 0, 0, 0.5); animation-delay: -1s; left: 80%; }
  .particle:nth-child(6n) { background: rgba(24, 119, 242, 0.5); animation-delay: -3s; left: 10%; }
  .particle:nth-child(7n) { animation-delay: -5s; left: 30%; }
  .particle:nth-child(8n) { animation-delay: -7s; left: 50%; }
  .particle:nth-child(9n) { animation-delay: -2.5s; left: 70%; }
  .particle:nth-child(10n) { animation-delay: -4.5s; left: 90%; }
  
  .scanline-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1) 50%);
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 9998;
    opacity: 0.3;
  }
  
  .error-shake { animation: shake 0.5s ease-in-out; }
  
  .status-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 30px;
    background: linear-gradient(135deg, rgba(255, 0, 0, 0.95), rgba(180, 0, 0, 0.95));
    border: 2px solid #ff3333;
    color: #fff;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 40px rgba(255, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }
  
  .card-youtube { animation: glowRed 3s ease-in-out infinite; }
  .card-facebook { animation: glowBlue 3s ease-in-out infinite; }
  .card-tiktok { animation: glowPurple 3s ease-in-out infinite; }
  
  .btn-youtube {
    background: linear-gradient(135deg, #FF0000, #CC0000) !important;
    box-shadow: 0 10px 30px rgba(255, 0, 0, 0.5) !important;
    position: relative;
    overflow: hidden;
  }
  .btn-youtube::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: 0.5s;
  }
  .btn-youtube:hover::before {
    left: 100%;
  }
  .btn-youtube:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 15px 40px rgba(255, 0, 0, 0.7) !important;
  }
  
  .btn-facebook {
    background: linear-gradient(135deg, #1877F2, #0d5cb6) !important;
    box-shadow: 0 10px 30px rgba(24, 119, 242, 0.5) !important;
    position: relative;
    overflow: hidden;
  }
  .btn-facebook::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: 0.5s;
  }
  .btn-facebook:hover::before {
    left: 100%;
  }
  .btn-facebook:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 15px 40px rgba(24, 119, 242, 0.7) !important;
  }
  
  .btn-tiktok {
    background: linear-gradient(135deg, #EC4899, #BE123C) !important;
    box-shadow: 0 10px 30px rgba(236, 72, 153, 0.5) !important;
    position: relative;
    overflow: hidden;
  }
  .btn-tiktok::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: 0.5s;
  }
  .btn-tiktok:hover::before {
    left: 100%;
  }
  .btn-tiktok:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 15px 40px rgba(236, 72, 153, 0.7) !important;
  }
  
  .icon-float { animation: float 4s ease-in-out infinite; display: inline-block; }
  
  .shimmer-text {
    background: linear-gradient(90deg, #fff, #ff6b6b, #fff, #6b9fff, #fff);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  
  .author-glow {
    animation: heartbeat 2s ease-in-out infinite;
    display: inline-block;
  }
  
  @media (max-width: 900px) {
    .platform-grid { 
      flex-direction: column !important; 
      align-items: center !important; 
      overflow-x: hidden !important;
    }
    .platform-card { 
      max-width: 100% !important; 
      width: 100% !important; 
      min-width: unset !important;
    }
  }
  
  @media (max-width: 600px) {
    .main-title { font-size: 36px !important; }
    .subtitle { font-size: 14px !important; }
  }
`;

// ==========================================
// COMPONENTS
// ==========================================
const ErrorToast = memo(({ message }: { message: string }) => (
  <div className="status-toast error-shake">
    <span>⚠️</span>
    {message}
  </div>
));

const LoadingOverlay = memo(({ 
  platform, 
  progress, 
  currentStage 
}: { 
  platform: Platform; 
  progress: number; 
  currentStage: DownloadStage;
}) => {
  let stages: StageConfig[];
  let accentColor: string;

  if (platform === 'facebook') {
    stages = FACEBOOK_STAGES;
    accentColor = '#1877F2';
  } else if (platform === 'tiktok') {
    stages = TIKTOK_STAGES;
    accentColor = '#EC4899';
  } else {
    stages = YOUTUBE_STAGES;
    accentColor = '#FF0000';
  }

  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease',
      backdropFilter: 'blur(10px)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'rgba(10, 10, 10, 0.98)',
        border: `3px solid ${accentColor}`,
        borderRadius: '20px',
        padding: '35px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: `0 0 80px ${accentColor}40, inset 0 0 30px ${accentColor}20`,
        animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 15px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${accentColor}, ${platform === 'facebook' ? '#0d5cb6' : platform === 'tiktok' ? '#BE123C' : '#CC0000'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            animation: 'pulse 2s infinite',
            boxShadow: `0 0 30px ${accentColor}`
          }}>
            {platform === 'facebook' ? '📘' : platform === 'tiktok' ? '🎵' : '▶️'}
          </div>
          <h2 style={{
            color: accentColor,
            fontSize: '22px',
            fontWeight: 900,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            margin: 0,
            textShadow: `0 0 20px ${accentColor}80`
          }}>
            {platform === 'facebook' ? 'FACEBOOK' : platform === 'tiktok' ? 'TIKTOK' : 'YOUTUBE'} DOWNLOAD
          </h2>
        </div>

        <div style={{
          height: '12px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '6px',
          overflow: 'hidden',
          border: `1px solid ${accentColor}40`,
          marginBottom: '10px'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${platform === 'facebook' ? '#4a9eff' : platform === 'tiktok' ? '#ff6b9d' : '#ff6b6b'})`,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '6px',
            boxShadow: `0 0 20px ${accentColor}`
          }} />
        </div>
        <p style={{ color: accentColor, textAlign: 'right', fontSize: '14px', fontWeight: 'bold', margin: '0 0 25px 0' }}>
          {progress}%
        </p>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: `1px solid ${accentColor}30`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          {stages.map((stage, index) => {
            const isComplete = index < currentIndex;
            const isActive = index === currentIndex;
            
            return (
              <div key={stage.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 0',
                opacity: isComplete || isActive ? 1 : 0.4,
                transition: 'all 0.3s ease'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  backgroundColor: isComplete ? '#00ff00' : isActive ? accentColor : 'rgba(255,255,255,0.1)',
                  color: isComplete || isActive ? '#000' : '#fff',
                  boxShadow: isActive ? `0 0 15px ${accentColor}` : 'none'
                }}>
                  {isComplete ? '✓' : stage.emoji}
                </span>
                <span style={{
                  color: isActive ? accentColor : '#888',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 400
                }}>
                  {stage.label}
                </span>
                {isActive && (
                  <span style={{
                    marginLeft: 'auto',
                    width: '8px',
                    height: '8px',
                    backgroundColor: accentColor,
                    borderRadius: '50%',
                    animation: 'pulse 1s infinite'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '15px',
          backgroundColor: `${accentColor}15`,
          border: `1px solid ${accentColor}40`,
          borderRadius: '10px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            backgroundColor: accentColor,
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite',
            boxShadow: `0 0 10px ${accentColor}`
          }} />
          <span style={{ color: '#ccc', fontSize: '13px' }}>
            {currentStage === 'connecting' && 'Establishing secure connection...'}
            {currentStage === 'fetching' && 'Retrieving video metadata...'}
            {currentStage === 'quality' && 'Processing optimal quality...'}
            {currentStage === 'starting' && 'Initializing download stream...'}
            {currentStage === 'downloading' && 'Downloading content to your device...'}
            {currentStage === 'complete' && 'Download completed successfully!'}
            {!currentStage && 'Preparing download...'}
          </span>
        </div>
      </div>
    </div>
  );
});

const PlatformCard = memo(({ 
  platform, 
  url, 
  setUrl, 
  loading, 
  onDownload 
}: { 
  platform: 'youtube' | 'facebook' | 'tiktok';
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
  onDownload: () => void;
}) => {
  let accentColor: string;
  let cardClass: string;
  let btnClass: string;
  let icon: string;
  let title: string;
  let subtitle: string;
  let buttonText: string;
  let gradientEnd: string;

  if (platform === 'facebook') {
    accentColor = '#1877F2';
    cardClass = 'card-facebook';
    btnClass = 'btn-facebook';
    icon = '📘';
    title = 'Facebook';
    subtitle = 'Reel & Video Downloader';
    buttonText = 'Download Reel';
    gradientEnd = '#0d5cb6';
  } else if (platform === 'tiktok') {
    accentColor = '#EC4899';
    cardClass = 'card-tiktok';
    btnClass = 'btn-tiktok';
    icon = '🎵';
    title = 'TikTok';
    subtitle = 'Video & Sound Downloader';
    buttonText = 'Download Video';
    gradientEnd = '#BE123C';
  } else {
    accentColor = '#FF0000';
    cardClass = 'card-youtube';
    btnClass = 'btn-youtube';
    icon = '▶️';
    title = 'YouTube';
    subtitle = 'Video Downloader';
    buttonText = 'Download Video';
    gradientEnd = '#CC0000';
  }
  
  return (
    <div className={`platform-card ${cardClass}`} style={{
      backgroundColor: 'rgba(15, 15, 15, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '30px',
      padding: '40px 35px',
      width: '100%',
      maxWidth: '420px',
      minWidth: '380px',
      border: `2px solid ${accentColor}50`,
      boxShadow: `0 20px 60px ${accentColor}30, inset 0 0 20px rgba(255,255,255,0.02)`,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      transform: loading ? 'scale(0.95)' : 'scale(1)',
      opacity: loading ? 0.7 : 1,
      pointerEvents: loading ? 'none' : 'auto',
      flex: '1 1 400px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      
      <div style={{ textAlign: 'center', marginBottom: '35px', position: 'relative', zIndex: 1 }}>
        <div className="icon-float" style={{
          width: '90px',
          height: '90px',
          margin: '0 auto 25px',
          borderRadius: '24px',
          background: `linear-gradient(135deg, ${accentColor}, ${gradientEnd})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '45px',
          boxShadow: `0 15px 50px ${accentColor}60`,
          border: `3px solid rgba(255,255,255,0.1)`
        }}>
          {icon}
        </div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 900,
          color: '#fff',
          margin: 0,
          letterSpacing: '-1px',
          marginBottom: '8px'
        }}>
          <span className="shimmer-text">{title}</span>
        </h2>
        <p style={{
          color: '#666',
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{ marginBottom: '25px', position: 'relative', zIndex: 1 }}>
        <input
          type="text"
          inputMode="url"
          placeholder={`Paste ${title} video URL...`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && !loading && onDownload()}
          style={{
            width: '100%',
            padding: '20px 24px',
            borderRadius: '16px',
            border: `2px solid ${accentColor}40`,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            fontSize: '15px',
            outline: 'none',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            boxShadow: `0 4px 20px ${accentColor}20`
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.boxShadow = `0 0 25px ${accentColor}50`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = `${accentColor}40`;
            e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}20`;
          }}
        />
      </div>

      <button
        onClick={onDownload}
        disabled={loading || !url.trim()}
        className={btnClass}
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: '16px',
          border: 'none',
          color: '#fff',
          fontSize: '17px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !url.trim() ? 0.6 : 1,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {loading ? (
          <>
            <span style={{ animation: 'pulse 1s infinite' }}>⚡</span>
            Processing...
          </>
        ) : (
          <>
            <span>⬇️</span>
            {buttonText}
          </>
        )}
      </button>

      <div style={{
        marginTop: '30px',
        paddingTop: '25px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'center',
        gap: '25px',
        fontSize: '11px',
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        fontWeight: 600,
        position: 'relative',
        zIndex: 1
      }}>
        <span style={{ color: accentColor }}>4K Quality</span>
        <span style={{ color: '#333' }}>•</span>
        <span>Fast</span>
        <span style={{ color: '#333' }}>•</span>
        <span>Free</span>
      </div>
    </div>
  );
});

// ==========================================
// MAIN APP
// ==========================================
function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<Platform>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<DownloadStage>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const styleId = 'streamfetch-styles';
    if (document.getElementById(styleId)) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = CSS_INJECTION;
    document.head.appendChild(styleSheet);
    
    return () => {
      const existing = document.getElementById(styleId);
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  const handleDownload = useCallback((platform: 'youtube' | 'facebook' | 'tiktok') => {
    const url = platform === 'youtube' ? youtubeUrl : platform === 'facebook' ? facebookUrl : tiktokUrl;
    
    if (!url.trim()) {
      setError(`Please paste a ${platform} link first!`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu)\.(com|be)\//i;
    const facebookRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\//i;
    const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|m\.tiktok\.com)\//i;
    
    if (platform === 'youtube' && !youtubeRegex.test(url)) {
      setError('Invalid YouTube URL!');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (platform === 'facebook' && !facebookRegex.test(url)) {
      setError('Invalid Facebook URL!');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (platform === 'tiktok' && !tiktokRegex.test(url)) {
      setError('Invalid TikTok URL!');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setCurrentPlatform(platform);
    setLoading(true);
    setProgress(0);
    setCurrentStage('connecting');

    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal ? 'http://localhost:4000/api/download' : '/api/download';
    const downloadUrl = `${baseUrl}?url=${encodeURIComponent(url)}`;
    
    const originalError = window.onerror;
    const originalUnhandledRejection = window.onunhandledrejection;
    
    window.onerror = (msg, url, line, col, error) => {
      if (typeof msg === 'string' && msg.includes('play()')) return true;
      if (originalError) return originalError(msg, url, line, col, error);
      return false;
    };
    
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'object' && 'name' in event.reason && 'message' in event.reason) {
        const reason = event.reason as any;
        if (reason.name === 'AbortError' && typeof reason.message === 'string' && reason.message.includes('play()')) {
          event.preventDefault();
          return;
        }
      }
      if (originalUnhandledRejection) {
        (originalUnhandledRejection as any)(event);
      }
    };

    const initiateDownload = async () => {
      try {
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error(`Download failed with status ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Cannot read response body');
        }

        const contentLength = parseInt(response.headers.get('content-length') || '0');
        let receivedLength = 0;
        const chunks: BlobPart[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          if (contentLength > 0) {
            const realProgress = Math.round((receivedLength / contentLength) * 100);
            const cappedProgress = Math.min(realProgress, 99);
            
            setProgress(cappedProgress);
            console.log(`📊 Real Download Progress: ${cappedProgress}%`);

            if (cappedProgress < 25) {
              setCurrentStage('fetching');
            } else if (cappedProgress < 50) {
              setCurrentStage('quality');
            } else if (cappedProgress < 75) {
              setCurrentStage('starting');
            } else {
              setCurrentStage('downloading');
            }
          } else {
            const estimatedProgress = Math.min(Math.floor(Math.random() * 30) + 10, 95);
            setProgress(estimatedProgress);
          }
        }

        const blob = new Blob(chunks as BlobPart[], { 
          type: response.headers.get('content-type') || 'application/octet-stream' 
        });

        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;

        const contentDisposition = response.headers.get('content-disposition');
        let filename = `video_${Date.now()}.mp4`;
        
        if (contentDisposition) {
          const filenamePart = contentDisposition.split('filename=')[1];
          if (filenamePart) {
            filename = filenamePart.replace(/"/g, '');
          }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        setProgress(100);
        setCurrentStage('complete');

      } catch (err: any) {
        console.error('❌ Download error:', err);
        
        if (platform === 'facebook' || platform === 'tiktok') {
          setError(`${platform.charAt(0).toUpperCase() + platform.slice(1)} temporarily unavailable. Try another video.`);
        } else {
          setError(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        
        setTimeout(() => setError(null), 4000);
      } finally {
        window.onerror = originalError;
        window.onunhandledrejection = originalUnhandledRejection;
      }
    };

    initiateDownload();

    setTimeout(() => {
      setLoading(false);
      setCurrentPlatform(null);
      setProgress(0);
      setCurrentStage(null);
      if (platform === 'youtube') setYoutubeUrl('');
      else if (platform === 'facebook') setFacebookUrl('');
      else setTiktokUrl('');
      
      window.onerror = originalError;
      window.onunhandledrejection = originalUnhandledRejection;
      window.location.href = '/';
    }, 120000);

  }, [youtubeUrl, facebookUrl, tiktokUrl]);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '80px 20px 40px 20px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <div className="animated-bg" />
      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 8}s` }} />
        ))}
      </div>
      <div className="scanline-overlay" />

      <div style={{ textAlign: 'center', marginBottom: '70px', zIndex: 1 }}>
        <h1 className="main-title" style={{
          fontSize: 'clamp(48px, 12vw, 72px)',
          fontWeight: 900,
          color: '#fff',
          margin: 0,
          letterSpacing: '-3px',
          textShadow: '0 0 50px rgba(255,0,0,0.6), 0 0 100px rgba(24,119,242,0.4)',
          marginBottom: '15px'
        }}>
          Stream<span style={{ 
            background: 'linear-gradient(90deg, #FF0000, #1877F2)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Fetch</span>
        </h1>
        <p className="subtitle" style={{
          color: '#777',
          fontSize: '18px',
          fontWeight: 500,
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Universal Video Downloader
        </p>
        <div style={{
          width: '100px',
          height: '4px',
          background: 'linear-gradient(90deg, #FF0000, #1877F2)',
          margin: '25px auto 0',
          borderRadius: '2px',
          boxShadow: '0 0 20px rgba(255,0,0,0.5)'
        }} />
      </div>

      {error && <ErrorToast message={error} />}

      {loading && currentPlatform && (
        <LoadingOverlay 
          platform={currentPlatform} 
          progress={progress} 
          currentStage={currentStage}
        />
      )}

      <div className="platform-grid" style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '50px',
        justifyContent: 'center',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '1350px',
        zIndex: 1,
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <PlatformCard
          platform="youtube"
          url={youtubeUrl}
          setUrl={setYoutubeUrl}
          loading={loading && currentPlatform === 'youtube'}
          onDownload={() => handleDownload('youtube')}
        />
        
        <PlatformCard
          platform="facebook"
          url={facebookUrl}
          setUrl={setFacebookUrl}
          loading={loading && currentPlatform === 'facebook'}
          onDownload={() => handleDownload('facebook')}
        />

        <PlatformCard
          platform="tiktok"
          url={tiktokUrl}
          setUrl={setTiktokUrl}
          loading={loading && currentPlatform === 'tiktok'}
          onDownload={() => handleDownload('tiktok')}
        />
      </div>

      <div style={{
        marginTop: '80px',
        textAlign: 'center',
        zIndex: 1,
        padding: '30px',
        borderRadius: '20px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{
          color: '#555',
          fontSize: '13px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          © 2026 StreamFetch
        </p>
        <p style={{
          color: '#888',
          fontSize: '16px',
          fontWeight: 600
        }}>
          Crafted with <span className="author-glow" style={{ color: '#ff3333' }}>🔥</span> by{' '}
          <span style={{ 
            color: '#fff', 
            fontWeight: 800,
            textShadow: '0 0 20px rgba(255,255,255,0.3)',
            background: 'linear-gradient(90deg, #FF0000, #1877F2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '18px'
          }}>
            Gilbert Favour James
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;