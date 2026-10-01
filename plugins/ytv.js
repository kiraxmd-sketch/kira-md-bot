// plugins/ytv.js - KIRA X MD (Multi-Resolution Auto Fallback YT Downloader)
const axios = require("axios");

// Sleep function for retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: "ytv",
    alias: ["yt", "video", "ytmp4" , "youtube"],
    category: "downloader",
    description: "Download YouTube video (Up to 1080p MP4)",
    usage: `${process.env.PREFIX || '.'}ytv <url> (or reply to a YouTube link)`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;

        // ─── Get URL from args or reply ───
        let url = args.join(" ").trim();

        if (!url) {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                const quotedText =
                    quoted.conversation ||
                    quoted.extendedTextMessage?.text ||
                    quoted.imageMessage?.caption ||
                    quoted.videoMessage?.caption ||
                    "";
                const match = quotedText.match(/https?:\/\/[^\s]+/);
                if (match) url = match[0];
            }
        }

        if (!url || !url.includes("youtu")) {
            return sock.sendMessage(jid, {
                text: `❌ *Missing YouTube URL*\n\n➤ ${process.env.PREFIX || '.'}ytv <url>\n➤ Or reply to a message containing a YouTube link.`
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

            // ─── APIs (1080p -> 720p -> 480p -> 360p Fallbacks) ───
            const apis = [
                `https://api.nexray.eu.cc/downloader/v1/ytmp4?url=${encodeURIComponent(url)}&resolusi=1080`,
                `https://api.nexray.eu.cc/downloader/v1/ytmp4?url=${encodeURIComponent(url)}&resolusi=720`,
                `https://api.nexray.eu.cc/downloader/v1/ytmp4?url=${encodeURIComponent(url)}&resolusi=480`,
                `https://api.nexray.eu.cc/downloader/v1/ytmp4?url=${encodeURIComponent(url)}&resolusi=360`,
                `https://eliteprotech-apis.zone.id/download/ytmp4?url=${encodeURIComponent(url)}`,
                `https://jerrycoder.oggyapi.workers.dev/down/ytmp4?url=${encodeURIComponent(url)}`,
                `https://jerrycoder.oggyapi.workers.dev/down/ytmp4-v1?url=${encodeURIComponent(url)}`,
                `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(url)}`
            ];

            let videoUrl = null;
            let title = "YouTube Video";
            let success = false;

            for (const api of apis) {
                if (success) break;

                // 2x RETRY LOGIC (25s Timeout for faster failover to next resolution)
                for (let attempt = 1; attempt <= 2; attempt++) {
                    try {
                        const { data } = await axios.get(api, { timeout: 25000, headers: { "User-Agent": "Mozilla/5.0" } });
                        
                        const candidateVideoUrl =
                            data?.result?.url ||
                            data?.url ||
                            data?.data?.url ||
                            data?.data?.dl ||
                            data?.result?.video ||
                            data?.download;

                        if (candidateVideoUrl && candidateVideoUrl.startsWith("http")) {
                            videoUrl = candidateVideoUrl;
                            title = data?.result?.title || data?.title || data?.data?.title || title;
                            success = true;
                            break; // Exit attempt loop on success
                        }
                    } catch (e) {
                        if (attempt < 2) await sleep(1500); 
                    }
                }
            }

            if (!videoUrl) throw new Error("No video URL found");

            // ─── Check File Size ───
            let isDocument = false;
            try {
                const headerRes = await axios.head(videoUrl, { timeout: 15000 });
                const contentLength = headerRes.headers['content-length'];
                
                if (contentLength) {
                    const sizeInMB = parseInt(contentLength) / (1024 * 1024);
                    // If size > 60MB, send as document
                    if (sizeInMB > 60) {
                        isDocument = true;
                    }
                }
            } catch (headErr) {
                // Ignore HEAD error
            }

            // ─── Send Video or Document ───
            if (isDocument) {
                await sock.sendMessage(jid, {
                    document: { url: videoUrl },
                    mimetype: 'video/mp4',
                    fileName: `${title.replace(/[^a-zA-Z0-9 ]/g, '')}.mp4`,
                    caption: `📄 *Sent as Document (Size > 60MB)*\n\n${title}`
                }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, {
                    video: { url: videoUrl },
                    caption: title 
                }, { quoted: msg });
            }

            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

        } catch (err) {
            console.error("YTV Error:", err.message);
            
            await sock.sendMessage(jid, {
                text: `❌ _Something went wrong or the video is too large, please try again later._`
            }, { quoted: msg });
            
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        }
    }
};