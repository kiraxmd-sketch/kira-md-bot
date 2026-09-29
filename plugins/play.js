// plugins/play.js – KIRA X MD (Ultra Fast Audio Downloader - Ultimate Anti-Bot Bypass)
const ytSearch = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { getSettings } = require('../lib/database');

// FFmpeg Path Setup
const ffmpegPath = path.join(__dirname, '../ffmpeg.exe');
if (fs.existsSync(ffmpegPath)) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'play',
    alias: ['song', 'yta', 'music', 'audio'],
    category: 'downloader',
    description: 'Search and play YouTube audio with high speed',
    usage: `${process.env.PREFIX || '.'}play <song name or link>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const query = (Array.isArray(args) ? args.join(' ') : '').trim();

        if (!query) {
            return await sock.sendMessage(jid, {
                text: `*Please provide a song name or YouTube link.*`
            }, { quoted: msg });
        }

        let statusMsg = null;

        try {
            const botNumber = sock.user?.id?.split(':')[0]?.replace(/[^0-9]/g, "") || "";
            const settings = typeof getSettings === 'function' ? (getSettings(botNumber) || {}) : {};
            const botName = settings.botName || process.env.BOT_NAME || global.config?.BOT_NAME || 'KIRA X MD';
            const ownerName = settings.ownerName || process.env.OWNER_NAME || global.config?.OWNER_NAME || 'Madhav';

            statusMsg = await sock.sendMessage(jid, { text: `*Searching* : \`${query}\`` }, { quoted: msg });

            let url = null;
            let youtubeId = null;
            let songInfo = null;

            const shortMatch = query.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
            if (shortMatch) {
                youtubeId = shortMatch[1];
                url = `https://youtu.be/${youtubeId}`;
            }

            if (!youtubeId) {
                const watchMatch = query.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
                if (watchMatch) {
                    youtubeId = watchMatch[1];
                    url = `https://www.youtube.com/watch?v=${youtubeId}`;
                }
            }

            if (!youtubeId) {
                const search = await ytSearch(query);
                if (!search?.videos?.length) throw new Error("No results found on YouTube.");
                songInfo = search.videos[0];
                url = songInfo.url;
            } else {
                try {
                    const info = await ytSearch({ videoId: youtubeId });
                    if (info) songInfo = info;
                } catch {}
                if (!songInfo) songInfo = { title: query, author: { name: ownerName } };
            }

            let title = songInfo?.title || "Unknown Song";
            let artist = songInfo?.author?.name || ownerName;
            
            title = title.replace(/["']/g, '');
            artist = artist.replace(/["']/g, '');

            if (statusMsg?.key) {
                await sock.sendMessage(jid, { text: `*Downloading* : ${title} | ${artist}`, edit: statusMsg.key });
            }

            const tempDir = path.join(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const inputPath = path.join(tempDir, `play_in_${Date.now()}.mp3`);
            const outputPath = path.join(tempDir, `play_out_${Date.now()}.mp3`);
            
            let downloadedToDisk = false;

            // Priority API List
            const apis = [
                `https://kiraxmd-api.vercel.app/api/play?query=${encodeURIComponent(url)}`,
                `https://kiraxmd-api.vercel.app/api/play?url=${encodeURIComponent(url)}`,
                `https://xenoytdl-2.vercel.app/api/youtube?url=${encodeURIComponent(url)}&format=mp3`,
                `https://jerrycoder.oggyapi.workers.dev/down/ytmp3-v1?url=${encodeURIComponent(url)}`,
                `https://jerrycoder.oggyapi.workers.dev/down/ytmp3?url=${encodeURIComponent(url)}`
            ];

            // 10 Retries per API with 20 seconds timeout and 3s gap
            for (const api of apis) {
                if (downloadedToDisk) break;
                
                for (let i = 0; i < 10; i++) {
                    try {
                        const res = await axios.get(api, { timeout: 20000, headers: { "User-Agent": "Mozilla/5.0" } });
                        const candidate = res.data?.result?.mp3 || res.data?.result?.url || res.data?.data?.dl || res.data?.data?.download || res.data?.download || res.data?.url || (typeof res.data?.result === "string" ? res.data.result : null) || (typeof res.data === "string" ? res.data : null);

                        if (candidate && typeof candidate === "string" && candidate.startsWith("http")) {
                            const audioResponse = await axios.get(candidate, { responseType: "arraybuffer", timeout: 20000 });
                            if (audioResponse.status === 200 && audioResponse.data) {
                                fs.writeFileSync(inputPath, Buffer.from(audioResponse.data));
                                downloadedToDisk = true;
                                break; 
                            }
                        }
                    } catch (err) {}

                    if (!downloadedToDisk && i < 9) {
                        await sleep(3000); 
                    }
                }
            }

            if (!downloadedToDisk) {
                throw new Error("All servers are temporarily blocked by YouTube. Please try again later.");
            }

            // ─────────────────────────────────────
            // FFMPEG METADATA TAGGING
            // ─────────────────────────────────────
            let sendBuffer = null;

            try {
                await new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .audioBitrate(128)
                        .outputOptions([
                            `-metadata`, `title=${title}`, 
                            `-metadata`, `artist=${artist}`,    
                            `-metadata`, `album=${botName}`
                        ])
                        .on("end", () => {
                            if (fs.existsSync(outputPath)) {
                                sendBuffer = fs.readFileSync(outputPath); 
                            }
                            resolve();
                        })
                        .on("error", (err) => {
                            if (fs.existsSync(inputPath)) {
                                sendBuffer = fs.readFileSync(inputPath); 
                            }
                            resolve(); 
                        })
                        .save(outputPath);
                });
            } catch (err) {
                if (fs.existsSync(inputPath)) sendBuffer = fs.readFileSync(inputPath);
            } finally {
                try {
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                } catch (e) {}
            }

            if (!sendBuffer) throw new Error("Final audio processing failed.");

            // ─────────────────────────────────────
            // SEND AUDIO TO WHATSAPP
            // ─────────────────────────────────────
            await sock.sendMessage(jid, {
                audio: sendBuffer,
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: `${title.replace(/[^a-zA-Z0-9 ]/g, '')}.mp3`
            }, { quoted: msg });

            if (statusMsg?.key) {
                try {
                    await sock.sendMessage(jid, { text: `*Downloaded* : ${title} | ${artist}`, edit: statusMsg.key });
                } catch {}
            }

        } catch (err) {
            const errorText = `*Download Failed* : \n\n${err.message}`;

            if (statusMsg?.key) {
                try {
                    await sock.sendMessage(jid, { text: errorText, edit: statusMsg.key });
                    return;
                } catch {}
            }
            try { await sock.sendMessage(jid, { text: errorText }, { quoted: msg }); } catch {}
        }
    }
};