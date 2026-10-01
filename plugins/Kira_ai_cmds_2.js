// plugins/Kira_ai_cmds_2.js - KIRA X MD (AI & Canvas Commands)
const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── HELPER: 5x RETRY API FETCHER ───
async function fetchApi(apiUrl, retries = 5, timeout = 30000, responseType = 'json') {
    for (let i = 1; i <= retries; i++) {
        try {
            const res = await axios.get(apiUrl, { timeout, responseType, headers: { "User-Agent": "Mozilla/5.0" } });
            return res.data;
        } catch (err) {
            if (i === retries) throw err;
            await sleep(2000);
        }
    }
}

// ─── HELPER: CATBOX UPLOADER (For Musiccard) ───
async function uploadToCatbox(buffer) {
    try {
        const FormData = require('form-data');
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, 'image.jpg');
        
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            timeout: 20000
        });
        return res.data;
    } catch (e) {
        throw new Error("Catbox upload failed.");
    }
}

module.exports = [
    // ==========================================
    // 1. SUNO AI (Music Generator)
    // ==========================================
    {
        name: 'suno',
        alias: ['aimusic', 'makesong'],
        category: 'ai',
        description: 'Generate a song using Suno AI',
        usage: '.suno <prompt>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const prompt = args.join(' ').trim();

            if (!prompt) return await sock.sendMessage(jid, { text: "❌ *Give me a prompt!*\n_Example: .suno romantic song about raining_" }, { quoted: msg });

            await sock.sendMessage(jid, { react: { text: "🎶", key: msg.key } });
            const statusMsg = await sock.sendMessage(jid, { text: "⏳ *Generating your song...*\n_This may take 1-2 minutes. Please be patient!_" }, { quoted: msg });

            try {
                // 120000ms (2 Mins) timeout since Suno takes around 80-90 seconds
                const data = await fetchApi(`https://api.nexray.eu.cc/ai/suno?prompt=${encodeURIComponent(prompt)}`, 5, 120000);

                if (!data?.status || !data?.result?.url) throw new Error("Failed to generate song");

                const result = data.result;
                const audioBuffer = await fetchApi(result.url, 3, 60000, 'arraybuffer');

                // Send Audio with Thumbnail AdReply
                await sock.sendMessage(jid, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: result.title || "Suno AI Song",
                            body: result.tags || "AI Generated Music",
                            mediaType: 1,
                            thumbnailUrl: result.thumbnail || "https://files.catbox.moe/22x0j5.jpeg",
                            sourceUrl: result.url,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: msg });

                // Send Lyrics separately
                if (result.lyrics) {
                    await sock.sendMessage(jid, { text: `📜 *Lyrics - ${result.title}*\n\n${result.lyrics}` }, { quoted: msg });
                }

                await sock.sendMessage(jid, { delete: statusMsg.key });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("Suno Error:", err.message);
                await sock.sendMessage(jid, { text: "❌ *Failed to generate song. API might be busy.*", edit: statusMsg.key });
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            }
        }
    },

    // ==========================================
    // 2. CLAUDE AI
    // ==========================================
    {
        name: 'claude',
        category: 'ai',
        description: 'Chat with Claude AI',
        usage: '.claude <message>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const text = args.join(' ').trim();
            if (!text) return await sock.sendMessage(jid, { text: "❌ *What do you want to ask Claude?*" }, { quoted: msg });

            await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
            try {
                const data = await fetchApi(`https://api.nexray.eu.cc/ai/claude?text=${encodeURIComponent(text)}`, 5, 30000);
                if (!data?.status || !data?.result) throw new Error("API Error");
                
                await sock.sendMessage(jid, { text: data.result }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                await sock.sendMessage(jid, { text: "❌ *Claude AI is not responding.*" }, { quoted: msg });
            }
        }
    },

    // ==========================================
    // 3. COPILOT AI
    // ==========================================
    {
        name: 'copilot',
        alias: ['bing'],
        category: 'ai',
        description: 'Chat with Microsoft Copilot',
        usage: '.copilot <message>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const text = args.join(' ').trim();
            if (!text) return await sock.sendMessage(jid, { text: "❌ *What do you want to ask Copilot?*" }, { quoted: msg });

            await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
            try {
                const data = await fetchApi(`https://api.nexray.eu.cc/ai/copilot?text=${encodeURIComponent(text)}`, 5, 30000);
                if (!data?.status || !data?.result) throw new Error("API Error");
                
                await sock.sendMessage(jid, { text: data.result }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                await sock.sendMessage(jid, { text: "❌ *Copilot AI is not responding.*" }, { quoted: msg });
            }
        }
    },

    // ==========================================
    // 4. GITA GPT
    // ==========================================
    {
        name: 'gitagpt',
        alias: ['gita', 'krishna'],
        category: 'ai',
        description: 'Get spiritual answers from Bhagavad Gita',
        usage: '.gitagpt <question>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const text = args.join(' ').trim();
            if (!text) return await sock.sendMessage(jid, { text: "❌ *Ask a question to receive wisdom from the Gita.*" }, { quoted: msg });

            await sock.sendMessage(jid, { react: { text: "🦚", key: msg.key } });
            try {
                const data = await fetchApi(`https://api.nexray.eu.cc/ai/gitagpt?text=${encodeURIComponent(text)}`, 5, 30000);
                if (!data?.status || !data?.result) throw new Error("API Error");
                
                await sock.sendMessage(jid, { text: `🦚 *Gita GPT:*\n${data.result}` }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                await sock.sendMessage(jid, { text: "❌ *Failed to connect to Gita GPT.*" }, { quoted: msg });
            }
        }
    },

    // ==========================================
    // 5. LUMIN AI
    // ==========================================
    {
        name: 'lumin',
        category: 'ai',
        description: 'Chat with Lumin AI',
        usage: '.lumin <message>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const text = args.join(' ').trim();
            if (!text) return await sock.sendMessage(jid, { text: "❌ *What do you want to ask Lumin?*" }, { quoted: msg });

            await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
            try {
                const data = await fetchApi(`https://api.nexray.eu.cc/ai/lumin?text=${encodeURIComponent(text)}`, 5, 30000);
                if (!data?.status || !data?.result) throw new Error("API Error");
                
                await sock.sendMessage(jid, { text: data.result }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                await sock.sendMessage(jid, { text: "❌ *Lumin AI is not responding.*" }, { quoted: msg });
            }
        }
    },

    // ==========================================
    // 6. MUSIC CARD (Canvas Generator)
    // ==========================================
    {
        name: 'musiccard',
        alias: ['spotifycard'],
        category: 'logo',
        description: 'Generate a Spotify-style Music Card',
        usage: '.musiccard <Title> | <Artist> (reply to an image)',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = msg.message?.imageMessage || quoted?.imageMessage;
            
            if (!isImage) {
                return await sock.sendMessage(jid, { text: "❌ *Reply to an image to create a music card!*" }, { quoted: msg });
            }

            const inputArgs = args.join(' ').split('|').map(item => item.trim());
            const judul = inputArgs[0] || "Unknown Song";
            const nama = inputArgs[1] || "Unknown Artist";

            await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

            try {
                // Download Image
                const mediaMessage = quoted?.imageMessage ? quoted : msg.message;
                const buffer = await downloadMediaMessage({ message: mediaMessage }, 'buffer', {}, { logger: console });
                
                // Upload to Catbox
                const catboxUrl = await uploadToCatbox(buffer);

                // Fetch Music Card Canvas (Response is an image buffer)
                const apiUrl = `https://api.nexray.eu.cc/canvas/musiccard?judul=${encodeURIComponent(judul)}&nama=${encodeURIComponent(nama)}&image_url=${encodeURIComponent(catboxUrl)}`;
                const imageBuffer = await fetchApi(apiUrl, 5, 30000, 'arraybuffer');

                await sock.sendMessage(jid, {
                    image: imageBuffer,
                    caption: `🎵 *Title:* ${judul}\n🎤 *Artist:* ${nama}`
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("MusicCard Error:", err.message);
                await sock.sendMessage(jid, { text: "❌ *Failed to generate music card.*" }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            }
        }
    }
];