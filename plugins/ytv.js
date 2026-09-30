// plugins/ytv.js - KIRA X MD (YouTube Video Downloader with 60MB limit check)
const axios = require("axios");

// Sleep function for retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: "ytv",
    alias: ["yt", "video", "ytmp4" , "youtube"],
    category: "downloader",
    description: "Download YouTube video (MP4)",
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

            // ─── APIs (Fastest APIs Priority) ───
            const apis = [
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

                // 3x RETRY LOGIC
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        const { data } = await axios.get(api, { timeout: 15000 });
                        
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
                        if (attempt < 3) await sleep(2000); 
                    }
                }
            }

            if (!videoUrl) throw new Error("No video URL found");

            // ─── Check File Size ───
            let isDocument = false;
            try {
                const headerRes = await axios.head(videoUrl, { timeout: 10000 });
                const contentLength = headerRes.headers['content-length'];
                
                if (contentLength) {
                    const sizeInMB = parseInt(contentLength) / (1024 * 1024);
                    // If size > 60MB, send as document
                    if (sizeInMB > 60) {
                        isDocument = true;
                    }
                }
            } catch (headErr) {
                // If HEAD fails, assume normal size and proceed, WhatsApp will reject if it's too big anyway
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
                text: `❌ _Something went wrong, please try again later._`
            }, { quoted: msg });
            
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        }
    }
}; 