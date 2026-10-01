// plugins/Kira_anime_cmd.js - KIRA X MD (Anime Reaction & Maker Commands)
const axios = require('axios');

// ─── HELPER: SMART API URL FETCHER ───
async function fetchAnimeUrl(type) {
    const apiUrl = `https://api.nexray.eu.cc/random/anime?type=${type}`;
    for (let i = 1; i <= 2; i++) {
        try {
            const res = await axios.get(apiUrl, { timeout: 10000, headers: { "User-Agent": "Mozilla/5.0" } });
            const data = res.data;

            // Smart extraction for different possible JSON structures
            const mediaUrl = 
                data?.result || 
                data?.url || 
                data?.data?.url || 
                data?.data || 
                (typeof data === 'string' ? data : null);

            if (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.startsWith('http')) {
                return mediaUrl;
            }
        } catch (err) {
            if (i === 2) throw new Error("API failed to return valid URL");
        }
    }
    throw new Error("No media URL found");
}

// ─── HELPER: DOWNLOAD BUFFER AND SEND ───
async function sendAnimeReaction(sock, msg, type, description) {
    const jid = msg.key.remoteJid;
    try {
        await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
        
        // 1. Get the media URL from API safely
        const mediaUrl = await fetchAnimeUrl(type);

        // 2. Download the media as buffer
        const mediaRes = await axios.get(mediaUrl, { 
            responseType: 'arraybuffer', 
            timeout: 15000,
            headers: { "User-Agent": "Mozilla/5.0" } 
        });
        const mediaBuffer = Buffer.from(mediaRes.data);
        const isGif = mediaUrl.endsWith(".gif") || mediaUrl.includes("gif");

        // 3. Send to WhatsApp
        if (isGif) {
            await sock.sendMessage(jid, { 
                video: mediaBuffer, 
                gifPlayback: true,
                caption: `🌸 *${description}*` 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(jid, { 
                image: mediaBuffer, 
                caption: `🌸 *${description}*` 
            }, { quoted: msg });
        }

        await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
    } catch (err) {
        console.error(`Anime API Error (${type}):`, err.message);
        await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        await sock.sendMessage(jid, { text: `❌ *Failed to fetch ${type}. Please try again.*` }, { quoted: msg });
    }
}

module.exports = [
    {
        name: 'neko', category: 'anime', description: 'Random Neko anime image',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'neko', 'Random Neko'); }
    },
    {
        name: 'shinobu', category: 'anime', description: 'Random Shinobu anime image',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'shinobu', 'Shinobu Oshino'); }
    },
    {
        name: 'megumin', category: 'anime', description: 'Random Megumin anime image',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'megumin', 'Megumin'); }
    },
    {
        name: 'bully', category: 'anime', description: 'Random bully anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'bully', 'Anime Bully Reaction'); }
    },
    {
        name: 'cuddle', category: 'anime', description: 'Random cuddle anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'cuddle', 'Anime Cuddle'); }
    },
    {
        name: 'cry', category: 'anime', description: 'Random cry anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'cry', 'Anime Cry'); }
    },
    {
        name: 'awoo', category: 'anime', description: 'Random awoo anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'awoo', 'Anime Awoo'); }
    },
    {
        name: 'lick', category: 'anime', description: 'Random lick anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'lick', 'Anime Lick'); }
    },
    {
        name: 'pat', category: 'anime', description: 'Random pat anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'pat', 'Anime Pat'); }
    },
    {
        name: 'smug', category: 'anime', description: 'Random smug anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'smug', 'Anime Smug'); }
    },
    {
        name: 'bonk', category: 'anime', description: 'Random bonk anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'bonk', 'Anime Bonk'); }
    },
    {
        name: 'yeet', category: 'anime', description: 'Random yeet anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'yeet', 'Anime Yeet'); }
    },
    {
        name: 'blush', category: 'anime', description: 'Random blush anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'blush', 'Anime Blush'); }
    },
    {
        name: 'smile', category: 'anime', description: 'Random smile anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'smile', 'Anime Smile'); }
    },
    {
        name: 'highfive', category: 'anime', description: 'Random highfive anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'highfive', 'Anime Highfive'); }
    },
    {
        name: 'handhold', category: 'anime', description: 'Random handhold anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'handhold', 'Anime Handhold'); }
    },
    {
        name: 'nom', category: 'anime', description: 'Random nom anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'nom', 'Anime Nom'); }
    },
    {
        name: 'bite', category: 'anime', description: 'Random bite anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'bite', 'Anime Bite'); }
    },
    {
        name: 'glomp', category: 'anime', description: 'Random glomp anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'glomp', 'Anime Glomp'); }
    },
    {
        name: 'slap', category: 'anime', description: 'Random slap anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'slap', 'Anime Slap'); }
    },
    {
        name: 'kill', category: 'anime', description: 'Random kill anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'kill', 'Anime Kill'); }
    },
    {
        name: 'happy', category: 'anime', description: 'Random happy anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'happy', 'Anime Happy'); }
    },
    {
        name: 'wink', category: 'anime', description: 'Random wink anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'wink', 'Anime Wink'); }
    },
    {
        name: 'poke', category: 'anime', description: 'Random poke anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'poke', 'Anime Poke'); }
    },
    {
        name: 'dance', category: 'anime', description: 'Random dance anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'dance', 'Anime Dance'); }
    },
    {
        name: 'cringe', category: 'anime', description: 'Random cringe anime reaction',
        async execute(sock, msg) { await sendAnimeReaction(sock, msg, 'cringe', 'Anime Cringe'); }
    },
    // ==========================================
    // 27. BRAT ANIME MAKER
    // ==========================================
    {
        name: 'bratanime',
        category: 'anime',
        description: 'Create a brat anime style image with text',
        usage: '.bratanime <text>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const text = args.join(' ').trim();

            if (!text) {
                return await sock.sendMessage(jid, { text: "❌ *Please provide some text!*\n_Example: .bratanime Kira X MD_" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

                const apiUrl = `https://api.nexray.eu.cc/maker/bratanime?text=${encodeURIComponent(text)}`;
                
                // Fetch Image Buffer
                const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const imageBuffer = Buffer.from(res.data);

                await sock.sendMessage(jid, { 
                    image: imageBuffer, 
                    caption: `🌸 *Brat Anime Maker*\n\n📝 Text: ${text}` 
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("Brat Anime Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to generate image. Please try again later.*" }, { quoted: msg });
            }
        }
    }
];