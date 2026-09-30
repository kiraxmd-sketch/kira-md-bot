// plugins/fb.js – KIRA X MD (Ultra Fast Promise.any Implementation)

const axios = require("axios");

function decodeHTMLEntities(text) {
    if (!text) return "";
    return text
        .replace(/&#([xX]?)([0-9a-fA-F]+);?/g, (_, isHex, num) => String.fromCharCode(parseInt(num, isHex ? 16 : 10)))
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

module.exports = {
    name: "fb",
    alias: ["facebook", "fbdl"],
    category: "downloader",
    description: "Download Facebook videos in HD with Extreme Speed",
    usage: `${process.env.PREFIX || "."}fb <url>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const prefix = process.env.PREFIX || ".";
        let url = Array.isArray(args) ? args.join(" ").trim() : "";

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        if (!url && quoted) {
            const quotedText =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                quoted.imageMessage?.caption ||
                quoted.videoMessage?.caption ||
                "";
            const match = quotedText.match(/https?:\/\/(?:www\.|m\.|mbasic\.)?(?:facebook\.com|fb\.watch|fb\.gg)\/[^\s<>"']+/i);
            if (match) url = match[0].replace(/[)\]}>.,!?]+$/g, "");
        }

        if (!url) {
            return await sock.sendMessage(jid, {
                text: `❌ Example:\n${prefix}fb https://fb.watch/xxxxx\n\nor reply to a Facebook link with ${prefix}fb`
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

            const apis = [
                `https://jerrycoder.oggyapi.workers.dev/down/fb?url=${encodeURIComponent(url)}`,
                `https://kiraxmd-api.vercel.app/api/fb?url=${encodeURIComponent(url)}`,
                `https://api-aswin-sparky.koyeb.app/api/downloader/fb?url=${encodeURIComponent(url)}`
            ];

            // 🚀 MEGA SPEED: Use Promise.any to fetch from the fastest API
            const fetchApi = async (apiUrl) => {
                const res = await axios.get(apiUrl, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } });
                if (res.data) {
                    return res.data;
                }
                throw new Error("Invalid response");
            };

            const data = await Promise.any(apis.map(api => fetchApi(api)));

            if (!data) throw new Error("All APIs failed");

            // EXTRACT VIDEO URL (PRIORITIZING HD)
            let videoUrl = null;

            if (data?.results && Array.isArray(data.results)) {
                const hdVideo = data.results.find(v => v.quality && (v.quality.includes('HD') || v.quality.includes('720p')) && v.url && v.url.startsWith('http'));
                if (hdVideo) {
                    videoUrl = hdVideo.url;
                } else {
                    const sdVideo = data.results.find(v => v.quality && !v.quality.includes('kbps') && v.url && v.url.startsWith('http'));
                    if (sdVideo) videoUrl = sdVideo.url;
                }
            }

            if (!videoUrl) {
                const potentialVideos = [
                    data?.result?.hd, data?.result?.video, data?.result?.sd, data?.result?.url,
                    data?.data?.hd, data?.data?.video, data?.data?.sd, data?.data?.url,
                    data?.hd, data?.video, data?.url
                ];

                for (const v of potentialVideos) {
                    if (typeof v === 'string' && v.startsWith('http')) {
                        videoUrl = v;
                        break;
                    }
                }
            }

            if (!videoUrl) throw new Error("No valid video string found");

            // EXTRACT TITLE
            const rawTitle = data?.title || data?.result?.title || data?.result?.desc || data?.data?.title || data?.data?.desc || "";
            const title = decodeHTMLEntities(rawTitle);

            // SEND VIDEO DIRECTLY
            await sock.sendMessage(jid, {
                video: { url: videoUrl },
                caption: title 
            }, { quoted: msg });

            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

        } catch (err) {
            console.error("FB ERROR:", err.message);

            await sock.sendMessage(jid, {
                text: "❌ _Something went wrong, please try again later._"
            }, { quoted: msg });

            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        }
    }
};