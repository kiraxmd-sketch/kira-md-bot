// plugins/play.js – KIRA X MD (Ultra Fast Audio Downloader - No FFmpeg Delay)
const ytSearch = require('yt-search');
const axios = require('axios');
const { getSettings } = require('../lib/database');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'play',
    alias: ['song', 'yta', 'music', 'audio'],
    category: 'downloader',
    description: 'Search and play YouTube audio with extreme speed',
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
            
            let audioBuffer = null;

            // Priority API List
            const apis = [
                `https://kiraxmd-api.vercel.app/api/play?query=${encodeURIComponent(url)}`,
                `https://kiraxmd-api.vercel.app/api/play?url=${encodeURIComponent(url)}`,
                `https://xenoytdl-2.vercel.app/api/youtube?url=${encodeURIComponent(url)}&format=mp3`,
                `https://jerrycoder.oggyapi.workers.dev/down/ytmp3-v1?url=${encodeURIComponent(url)}`,
                `https://jerrycoder.oggyapi.workers.dev/down/ytmp3?url=${encodeURIComponent(url)}`
            ];

            // Direct Buffer Download (Super Fast)
            for (const api of apis) {
                if (audioBuffer) break;
                
                for (let i = 0; i < 3; i++) { // Reduced retry count to speed up failover
                    try {
                        const res = await axios.get(api, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } });
                        const candidate = res.data?.result?.mp3 || res.data?.result?.url || res.data?.data?.dl || res.data?.data?.download || res.data?.download || res.data?.url || (typeof res.data?.result === "string" ? res.data.result : null) || (typeof res.data === "string" ? res.data : null);

                        if (candidate && typeof candidate === "string" && candidate.startsWith("http")) {
                            const audioResponse = await axios.get(candidate, { responseType: "arraybuffer", timeout: 20000 });
                            if (audioResponse.status === 200 && audioResponse.data) {
                                audioBuffer = Buffer.from(audioResponse.data);
                                break; 
                            }
                        }
                    } catch (err) {}

                    if (!audioBuffer && i < 2) {
                        await sleep(1000); // 1s gap instead of 3s to be faster
                    }
                }
            }

            if (!audioBuffer) {
                throw new Error("All servers are temporarily blocked by YouTube. Please try again later.");
            }

            // ─────────────────────────────────────
            // SEND AUDIO DIRECTLY TO WHATSAPP
            // ─────────────────────────────────────
            await sock.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: `${title.replace(/[^a-zA-Z0-9 ]/g, '')}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: artist,
                        mediaType: 1,
                        thumbnailUrl: songInfo?.thumbnail || "https://i.pinimg.com/736x/8f/3e/eb/8f3eeb0c1097bd5a3a0eec26f1c71285.jpg", 
                        sourceUrl: url,
                        renderLargerThumbnail: true
                    }
                }
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