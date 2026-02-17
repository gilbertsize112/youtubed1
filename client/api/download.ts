process.env.YTDL_NO_UPDATE = 'true'; 

import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/download', async (req: any, res: any) => {
    try {
        const videoURL = req.query.url as string;
        const format = req.query.format as string || 'mp4'; 
        
        // Pull the cookie you saved in Vercel Environment Variables
        const cookie = process.env.YT_COOKIE || '';

        if (!videoURL) {
            return res.status(400).send('Please provide a YouTube URL');
        }

        // Validate URL first
        if (!ytdl.validateURL(videoURL)) {
            return res.status(400).send('Invalid YouTube URL');
        }

        // Request options using your specific login cookie
        const requestOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Mode': 'navigate',
                'Cookie': cookie // This is the fix for the "Bot" error
            },
            ipv6Fallback: false 
        };

        console.log(`✨ Fetching info for ${format.toUpperCase()}: ${videoURL}`);
        console.log(cookie ? "✅ Using Authenticated Cookie" : "⚠️ Warning: No YT_COOKIE found in Env");

        const info = await ytdl.getInfo(videoURL, { requestOptions });
        const title = info.videoDetails.title.replace(/[^\x00-\x7F]/g, ""); 

        if (format === 'mp3') {
            res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
            console.log(`🎵 Streaming Audio (MP3): ${title}`);
            
            ytdl(videoURL, {
                quality: 'highestaudio',
                filter: 'audioonly',
                requestOptions
            }).pipe(res);

        } else {
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            console.log(`🎬 Streaming Video (MP4): ${title}`);

            ytdl(videoURL, {
                quality: 'highest',
                filter: 'audioandvideo',
                requestOptions
            }).pipe(res);
        }

    } catch (error: any) {
        console.error('❌ YTDL ERROR:', error.message);
        
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