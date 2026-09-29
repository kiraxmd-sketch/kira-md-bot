// plugins/pinterest.js - KIRA X MD
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Sleep function for retry delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'pinterest',
    alias: ['pin', 'pindl', 'pinsearch'],
    category: 'downloader',
    description: 'Download or Search Pinterest media',
    usage: '.pinterest <URL or Query>', 

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const input = (args && Array.isArray(args) ? args.join(' ') : '').trim();

        if (!input) {
            return await sock.sendMessage(jid, { 
                text: `❌ *What do you want from Pinterest?*\n\n📥 *To Download:* .pin <Pinterest Link>\n🔍 *To Search:* .pin anime wallpaper` 
            }, { quoted: msg });
        }

        // 🔥 Reaction ONLY loading (No Status Messages)
        await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

        const isUrlMatch = input.match(/(https?:\/\/(www\.)?(pinterest\.com|pin\.it)\/[^\s]+)/gi);
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        if (isUrlMatch) {
            // ─────────────────────────────────────
            // DOWNLOAD URL LOGIC (KIRA API ONLY)
            // ─────────────────────────────────────
            const url = isUrlMatch[0];
            let success = false;
            let finalFilePath = null;
            let isVideo = false;

            const api = `https://kiraxmd-api.vercel.app/api/pinterest?url=${encodeURIComponent(url)}`;

            // 10x RETRY LOGIC WITH 20s TIMEOUT & 3s GAP
            for (let attempt = 1; attempt <= 10; attempt++) {
                try {
                    const res = await axios.get(api, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
                    const data = res.data;

                    // Perfect JSON extraction
                    let mediaUrl = data?.result;

                    if (!mediaUrl || typeof mediaUrl !== 'string' || !mediaUrl.startsWith('http')) {
                        throw new Error("Invalid URL from API");
                    }

                    // Determine if it's a video
                    isVideo = data?.type === 'video' || mediaUrl.includes('.mp4') || mediaUrl.includes('video');

                    const mediaRes = await axios.get(mediaUrl, {
                        responseType: 'arraybuffer',
                        timeout: 25000, 
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });

                    const contentType = mediaRes.headers['content-type'] || '';
                    if (contentType.includes('video')) isVideo = true;
                    else if (contentType.includes('image')) isVideo = false;

                    const ext = isVideo ? '.mp4' : '.jpg';
                    finalFilePath = path.join(tempDir, `pin_${Date.now()}${ext}`);
                    
                    fs.writeFileSync(finalFilePath, Buffer.from(mediaRes.data));

                    const stats = fs.statSync(finalFilePath);
                    if (stats.size < 5000) {
                        throw new Error("Downloaded file is too small/corrupted.");
                    }

                    if (isVideo) {
                        await sock.sendMessage(jid, { video: { url: finalFilePath }, mimetype: 'video/mp4' }, { quoted: msg });
                    } else {
                        await sock.sendMessage(jid, { image: { url: finalFilePath }, mimetype: 'image/jpeg' }, { quoted: msg });
                    }

                    success = true;
                    // 🔥 Success Reaction
                    await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
                    break; 

                } catch (e) {
                    if (attempt < 10) await sleep(3000); // 3 seconds gap
                } finally {
                    try { if (finalFilePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (err) {}
                }
            }

            if (!success) {
                // 🔥 Failed Reaction
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            }

        } else {
            // ─────────────────────────────────────
            // SEARCH LOGIC (BOTH XENO & KIRA)
            // ─────────────────────────────────────
            let searchSuccess = false;
            
            // 2 APIs for Search
            const searchApis = [
                `https://xeno-pinterest.vercel.app/api/pinterest?query=${encodeURIComponent(input)}`,
                `https://kiraxmd-api.vercel.app/api/pinterest?q=${encodeURIComponent(input)}`
            ];

            for (const api of searchApis) {
                if (searchSuccess) break;

                // 10x RETRY LOGIC WITH 20s TIMEOUT & 3s GAP
                for (let attempt = 1; attempt <= 10; attempt++) { 
                    try {
                        const res = await axios.get(api, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
                        const data = res.data;
                        
                        // JSON extraction for array of search results
                        const results = data?.result;

                        if (!Array.isArray(results) || results.length === 0) throw new Error("No results found");

                        const maxImages = Math.min(results.length, 5);
                        let sentCount = 0;
                        
                        for (let i = 0; i < maxImages; i++) {
                            const imgUrl = results[i];
                            if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
                                try {
                                    const imgRes = await axios.get(imgUrl, {
                                        responseType: 'arraybuffer',
                                        timeout: 20000,
                                        headers: { 'User-Agent': 'Mozilla/5.0' }
                                    });
                                    
                                    await sock.sendMessage(jid, { image: Buffer.from(imgRes.data), mimetype: 'image/jpeg' });
                                    sentCount++;
                                    await sleep(1000); 
                                } catch (e) {
                                    // Skip this image and continue
                                }
                            }
                        }
                        
                        if (sentCount > 0) {
                            searchSuccess = true;
                            // 🔥 Success Reaction
                            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
                            break;
                        } else {
                            throw new Error("Failed to fetch image buffers.");
                        }

                    } catch (err) {
                        if (attempt < 10) await sleep(3000); // 3 seconds gap
                    }
                }
            }

            if (!searchSuccess) {
                // 🔥 Failed Reaction
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            }
        }
    }
};