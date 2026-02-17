process.env.YTDL_NO_UPDATE = 'true'; 

import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());

// Vercel handles the /api prefix, so we listen to the path defined in vercel.json
// Changed from '/download' to '/api/download' to match your frontend call
app.get('/api/download', async (req: any, res: any) => {
    try {
        const videoURL = req.query.url as string;
        const format = req.query.format as string || 'mp4'; 

        if (!videoURL) {
            return res.status(400).send('Please provide a YouTube URL');
        }

        console.log(`✨ Fetching info for ${format.toUpperCase()}...`);
        
        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\x00-\x7F]/g, ""); 

        if (format === 'mp3') {
            res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
            console.log(`🎵 Streaming Audio (MP3): ${title}`);
            
            ytdl(videoURL, {
                quality: 'highestaudio',
                filter: 'audioonly'
            }).pipe(res);

        } else {
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            console.log(`🎬 Streaming Video (MP4): ${title}`);

            ytdl(videoURL, {
                quality: 'highest',
                filter: 'audioandvideo'
            }).pipe(res);
        }

    } catch (error) {
        console.error('❌ Download Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

// Important: Export the app for Vercel
export default app;

// Local development logic
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 StreamFetch Local Server Active on Port ${PORT}`);
    });
}