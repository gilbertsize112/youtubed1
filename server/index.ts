// 1. STOP THE SCRIPT DUMPING: Must be at the very top
process.env.YTDL_NO_UPDATE = 'true'; 

import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();

// Updated CORS for Production: Allowing local and future cloud access
app.use(cors());

/**
 * CLEANUP SCRIPT: Deletes existing player-script.js files on startup
 */
const cleanupOldScripts = () => {
    try {
        const files = fs.readdirSync('./');
        files.forEach(file => {
            if (file.endsWith('-player-script.js')) {
                try {
                    fs.unlinkSync(path.join('./', file));
                } catch (err) {
                    // Silent catch
                }
            }
        });
    } catch (e) {
        console.log("Note: Cleanup skipped (likely directory read permissions)");
    }
};

const originalWarn = console.warn;
console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (
        message.includes('Please report this issue') || 
        message.includes('Could not parse') || 
        message.includes('player-script')
    ) {
        return; 
    }
    originalWarn(...args);
};

app.get('/download', async (req: any, res: any) => {
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


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    cleanupOldScripts(); 
    console.log(`🚀 StreamFetch Server Clean & Active on Port ${PORT}`);
    console.log(`Ready for requests!`);
});