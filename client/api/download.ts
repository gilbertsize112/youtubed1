import express from 'express';
import { execFile } from 'child_process';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';

const app = express();
app.use(cors());

// Validate YouTube URL
function isValidYouTubeURL(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
    return youtubeRegex.test(url);
}

app.get('/api/download', async (req: any, res: any) => {
    try {
        const videoURL = req.query.url as string;
        const format = req.query.format as string || 'mp4';

        if (!videoURL) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a YouTube URL' 
            });
        }

        // Validate URL
        if (!isValidYouTubeURL(videoURL)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid YouTube URL' 
            });
        }

        console.log(`✨ Downloading ${format.toUpperCase()}: ${videoURL}`);

        const tempDir = os.tmpdir();
        const timestamp = Date.now();
        const fileName = `streamfetch_${timestamp}`;
        const outputTemplate = path.join(tempDir, `${fileName}.%(ext)s`);

        // Prepare yt-dlp command
        let args: string[] = [];
        
        if (format === 'mp3') {
            args = [
                '-f', 'bestaudio/best',
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '192',
                '-o', outputTemplate,
                '--quiet',
                '--no-warnings',
                videoURL
            ];
        } else {
            args = [
                '-f', 'best[ext=mp4]/best',
                '-o', outputTemplate,
                '--quiet',
                '--no-warnings',
                videoURL
            ];
        }

        // Execute yt-dlp
        execFile('yt-dlp', args, { timeout: 300000 }, (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error('❌ Download error:', error.message);
                if (!res.headersSent) {
                    let message = 'Download failed';
                    if (error.message.includes('not found')) {
                        message = 'Video not found or is unavailable';
                    } else if (error.message.includes('private')) {
                        message = 'This video is private and cannot be downloaded';
                    } else if (error.message.includes('age')) {
                        message = 'This video is age-restricted';
                    }
                    res.status(500).json({
                        success: false,
                        message: message,
                        error: error.message
                    });
                }
                return;
            }

            const ext = format === 'mp3' ? 'mp3' : 'mp4';
            const downloadedFile = path.join(tempDir, `${fileName}.${ext}`);

            // Check if file exists
            if (!fs.existsSync(downloadedFile)) {
                console.error('❌ Downloaded file not found:', downloadedFile);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'File not found after download'
                    });
                }
                return;
            }

            console.log(`✅ ${format.toUpperCase()} downloaded successfully: ${downloadedFile}`);

            // Send file to client
            res.download(downloadedFile, `video.${ext}`, (downloadError) => {
                if (downloadError) {
                    console.error('❌ Error sending file:', downloadError.message);
                }

                // Clean up temp file after sending
                fs.unlink(downloadedFile, (unlinkError) => {
                    if (unlinkError) {
                        console.error('⚠️ Error deleting temp file:', unlinkError.message);
                    } else {
                        console.log(`🗑️ Cleaned up temp file: ${downloadedFile}`);
                    }
                });
            });
        });

    } catch (error: any) {
        console.error('❌ ERROR:', error.message);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
});

export default app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 StreamFetch Local Server Active on Port ${PORT}`);
    });
}