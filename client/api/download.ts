import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

function getPlatform(url: string): 'youtube' | 'facebook' | 'tiktok' | null {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//i;
  const facebookRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\//i;
  const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|m\.tiktok\.com)\//i;
  
  if (youtubeRegex.test(url)) return 'youtube';
  if (facebookRegex.test(url)) return 'facebook';
  if (tiktokRegex.test(url)) return 'tiktok';
  return null;
}

app.get('/api/download', async (req: express.Request, res: express.Response) => {
  try {
    let videoURL = req.query.url as string;
    const format = (req.query.format as string) || 'mp4';

    if (!videoURL) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a video URL' 
      });
    }

    let platform = getPlatform(videoURL);

    // ✅ Handle TikTok short URLs - expand them
    if (videoURL.includes('vt.tiktok.com') || videoURL.includes('vm.tiktok.com')) {
      try {
        console.log('🔄 Expanding TikTok short URL...');
        const response = await fetch(videoURL, { 
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        videoURL = response.url;
        platform = getPlatform(videoURL);
        console.log(`✨ Expanded TikTok URL: ${videoURL}`);
      } catch (expandError) {
        console.error('❌ Failed to expand TikTok URL:', expandError);
      }
    }

    if (!platform) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid URL' 
      });
    }

    console.log(`✨ Streaming from ${platform.toUpperCase()}`);

    const timestamp = Date.now();
    const ext = format === 'mp3' ? 'mp3' : 'mp4';
    const filename = `${platform}-video-${timestamp}.${ext}`;

    // ✅ CRITICAL: Set proper headers for Chrome download bar
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // ✅ IMPORTANT: Use chunked encoding for streaming
    // This tells Chrome: "I'm sending data in chunks, show progress bar"
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // ✅ Tell Chrome NOT to cache this response
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // ✅ Set status code FIRST before piping
    res.status(200);

    // Flush headers immediately so Chrome shows download bar
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    // Spawn yt-dlp to stream directly to stdout
    const args: string[] = [
      '-f', format === 'mp3' ? 'bestaudio/best' : 'best[ext=mp4]/best',
      '-o', '-',  // Output to stdout
      '--no-warnings',
      '--no-playlist',
      '--quiet',  // Reduce stderr noise
      ...(format === 'mp3' ? ['-x', '--audio-format', 'mp3', '--audio-quality', '192'] : []),
      videoURL
    ];

    console.log('🔄 Starting stream to browser...');

    const ytDlp = spawn('yt-dlp', args, {
      stdio: ['ignore', 'pipe', 'pipe']  // Explicitly set stdio
    });

    // ✅ Pipe stdout directly to response
    // This will trigger Chrome's download bar
    ytDlp.stdout.pipe(res);

    // Log progress from stderr
    ytDlp.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.log('📥', message);
      }
    });

    // Handle yt-dlp errors
    ytDlp.on('error', (error) => {
      console.error('❌ yt-dlp error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to start download'
        });
      }
      res.end();
    });

    ytDlp.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Download stream completed successfully');
      } else {
        console.error('❌ yt-dlp exited with code:', code);
      }
      // Don't call res.end() here - pipe handles it automatically
    });

    // Handle client cancellation (user stops download)
    req.on('close', () => {
      console.log('⚠️ Client cancelled, killing yt-dlp process');
      ytDlp.kill('SIGTERM');
    });

    // Handle unexpected disconnect
    req.on('error', (error) => {
      console.error('⚠️ Request error:', error);
      ytDlp.kill('SIGTERM');
    });

    // Handle response errors
    res.on('error', (error) => {
      console.error('⚠️ Response error:', error);
      ytDlp.kill('SIGTERM');
    });

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Download failed'
      });
    } else {
      res.end();
    }
  }
});

// ✅ Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 StreamFetch Server running on port ${PORT}`);
  console.log(`✨ Download endpoint: http://localhost:${PORT}/api/download?url=VIDEO_URL`);
});