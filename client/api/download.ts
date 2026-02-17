process.env.YTDL_NO_UPDATE = 'true'; 

import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';

const app = express();
app.use(cors());

// Shared request options to mimic a real browser
const requestOptions = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Mode': 'navigate'
    }
};

app.get('/api/download', async (req: any, res: any) => {
    try {
        const videoURL = req.query.url as string;
        const format = req.query.format as string || 'mp4'; 

        if (!videoURL) {
            return res.status(400).send('Please provide a YouTube URL');
        }

        console.log(`✨ Fetching info for ${format.toUpperCase()}...`);
        
        // Pass requestOptions here to avoid 403/500 errors during info fetching
        const info = await ytdl.getInfo(videoURL, { requestOptions });
        const title = info.videoDetails.title.replace(/[^\x00-\x7F]/g, ""); 

        if (format === 'mp3') {
            res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
            console.log(`🎵 Streaming Audio (MP3): ${title}`);
            
            ytdl(videoURL, {
                quality: 'highestaudio',
                filter: 'audioonly',
                requestOptions // Added here
            }).pipe(res);

        } else {
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            console.log(`🎬 Streaming Video (MP4): ${title}`);

            ytdl(videoURL, {
                quality: 'highest',
                filter: 'audioandvideo',
                requestOptions // Added here
            }).pipe(res);
        }

    } catch (error) {
        console.error('❌ Download Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
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