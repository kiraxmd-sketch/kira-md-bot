// plugins/insta.js - KIRA X MD (Ultra Fast Promise.any Implementation without Kira API)

const axios = require("axios");

module.exports = [
    {
        name: "insta",
        alias: ["ig", "instagram", "reel"],
        category: "downloader",
        description: "Instagram Downloader",
        usage: ".insta <link>",

        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            let url = (args || []).join(" ").trim();

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!url && quoted) {
                const text = 
                    quoted.conversation || 
                    quoted.extendedTextMessage?.text || 
                    quoted.imageMessage?.caption || 
                    quoted.videoMessage?.caption || 
                    "";
                const match = text.match(/https?:\/\/[^\s]+/i);
                if (match) url = match[0];
            }

            if (!url || !url.startsWith("http")) {
                return sock.sendMessage(jid, { 
                    text: "❌ *Example:* .insta <Instagram link>" 
                }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

                const apis = [
                    `https://jerrycoder.oggyapi.workers.dev/down/insta?url=${encodeURIComponent(url)}`,
                    `https://jerrycoder.oggyapi.workers.dev/down/insta-v1?url=${encodeURIComponent(url)}`,
                    `https://jerrycoder.oggyapi.workers.dev/down/insta-v2?url=${encodeURIComponent(url)}`,
                    `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`
                ];

                // 🚀 MEGA SPEED: Use Promise.any to fetch from the fastest API
                const fetchApi = async (apiUrl) => {
                    const res = await axios.get(apiUrl, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } });
                    const data = res.data;
                    
                    let items = null;
                    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
                        items = data.data;
                    } else if (data?.result && Array.isArray(data.result) && data.result.length > 0) {
                        items = data.result;
                    } else if (data?.urls && Array.isArray(data.urls) && data.urls.length > 0) {
                        items = data.urls;
                    }
                    
                    if (items) {
                        return items;
                    }
                    throw new Error("Invalid response");
                };

                const items = await Promise.any(apis.map(api => fetchApi(api)));

                if (!items) throw new Error("All APIs failed");

                // ─── SENDING MEDIA ───
                for (const item of items) {
                    const mediaUrl = item.url || item.url_download || item;
                    if (!mediaUrl || typeof mediaUrl !== 'string') continue;

                    const type = mediaUrl.includes('.mp4') || (item.type === "video") ? "video" : "image";

                    const mediaResponse = await axios.get(mediaUrl, { 
                        responseType: 'arraybuffer',
                        timeout: 60000 
                    });
                    const mediaBuffer = Buffer.from(mediaResponse.data);

                    if (type === "video") {
                        await sock.sendMessage(jid, { 
                            video: mediaBuffer, 
                            caption: "" 
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(jid, { 
                            image: mediaBuffer, 
                            caption: "" 
                        }, { quoted: msg });
                    }
                }

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("❌ INSTA ERROR:", err.message);
                await sock.sendMessage(jid, { text: "❌ _Something went wrong, please try again later._" }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            }
        }
    },

    {
        name: "snap",
        alias: ["snapchat", "snapdl"],
        category: "downloader",
        description: "Snapchat Spotlight/Video Downloader",
        usage: ".snap <link>",

        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            let url = (args || []).join(" ").trim();

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!url && quoted) {
                const text = 
                    quoted.conversation || 
                    quoted.extendedTextMessage?.text || 
                    quoted.imageMessage?.caption || 
                    quoted.videoMessage?.caption || 
                    "";
                const match = text.match(/https?:\/\/[^\s]+/i);
                if (match) url = match[0];
            }

            if (!url || !url.includes("snapchat.com")) {
                return sock.sendMessage(jid, { 
                    text: "❌ *Example:* .snap <Snapchat link>" 
                }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

                const apis = [
                    `https://jerrycoder.oggyapi.workers.dev/down/snap?url=${encodeURIComponent(url)}`,
                    `https://api-aswin-sparky.koyeb.app/api/downloader/snapchat?url=${encodeURIComponent(url)}` 
                ];

                 // 🚀 MEGA SPEED: Use Promise.any to fetch from the fastest API
                const fetchSnapApi = async (apiUrl) => {
                    const res = await axios.get(apiUrl, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } });
                    const data = res.data;
                    
                    let mediaUrl = null;
                    let captionText = "";
                    
                    if (data?.medias && data.medias.length > 0) {
                        mediaUrl = data.medias[0].url;
                        captionText = data.title || "";
                    } else if (data?.data?.url) {
                        mediaUrl = data.data.url;
                    } else if (data?.url) {
                        mediaUrl = data.url;
                    }
                    
                    if (mediaUrl) {
                        return { mediaUrl, captionText };
                    }
                    throw new Error("Invalid response");
                };
                
                const { mediaUrl, captionText } = await Promise.any(apis.map(api => fetchSnapApi(api)));

                if (!mediaUrl) throw new Error("No media found");

                const mediaResponse = await axios.get(mediaUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 60000 
                });
                const mediaBuffer = Buffer.from(mediaResponse.data);

                await sock.sendMessage(jid, { 
                    video: mediaBuffer, 
                    caption: captionText
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("❌ SNAP ERROR:", err.message);
                await sock.sendMessage(jid, { text: "❌ _Something went wrong, please try again later._" }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            }
        }
    }
];