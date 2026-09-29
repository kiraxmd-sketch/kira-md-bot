const axios = require('axios');
const { getBotName } = require('../index'); // Terabox caption-il bot name edukkan

module.exports = [
    // ─── 1. NARUTO VIDEO ───
    {
        name: 'narutovid',
        category: 'anime',
        description: 'Random Naruto video',
        usage: '.naruto',
        async execute(sock, msg) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });
                const { data } = await axios.get('https://jerrycoder.oggyapi.workers.dev/anime/naruto?json=true', { timeout: 15000 });
                if (!data?.url) throw new Error("Video URL not found");
                
                // 🔥 Buffer fix for random videos
                const videoRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 30000 });
                const videoBuffer = Buffer.from(videoRes.data);

                await sock.sendMessage(jid, { video: videoBuffer, caption: `🎬 *Naruto Uzumaki*` }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            } catch (e) {
                console.error("Naruto Error:", e.message);
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 2. ONE PIECE VIDEO ───
    {
        name: 'onepiece',
        category: 'anime',
        description: 'Random One Piece video',
        usage: '.onepiece',
        async execute(sock, msg) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });
                const { data } = await axios.get('https://jerrycoder.oggyapi.workers.dev/anime/onepiece?json=true', { timeout: 15000 });
                if (!data?.url) throw new Error("Video URL not found");
                
                // 🔥 Buffer fix for random videos
                const videoRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 30000 });
                const videoBuffer = Buffer.from(videoRes.data);

                await sock.sendMessage(jid, { video: videoBuffer, caption: `🎬 *One Piece*` }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            } catch (e) {
                console.error("One Piece Error:", e.message);
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 3. TIKTOK STALKER ───
    {
        name: 'tiktok',
        alias: ['ttstalk'],
        category: 'stalker',
        description: 'Stalk TikTok profile',
        usage: '.tiktok <username>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const input = args.join(" ").trim();
            if (!input) return await sock.sendMessage(jid, { text: '❌ *Provide a username!*\n_Example: .tiktok khaby.lame_' }, { quoted: msg });
            
            try {
                await sock.sendMessage(jid, { react: { text: '🔍', key: msg.key } });
                const { data } = await axios.get(`https://jerrycoder.oggyapi.workers.dev/stalk/tiktok?user=${encodeURIComponent(input)}`, { timeout: 15000 });
                if (data.status !== "success") return await sock.sendMessage(jid, { text: '❌ *User not found!*' }, { quoted: msg });
                
                const res = data.result;
                const caption = `👤 *TIKTOK STALKER*\n\n📛 *Name:* ${res.nickname}\n🔹 *Username:* @${res.username}\n👥 *Followers:* ${res.followers}\n👤 *Following:* ${res.following}\n❤️ *Likes:* ${res.likes}\n🎬 *Videos:* ${res.videos}\n📝 *Bio:* ${res.bio || 'N/A'}`;
                
                await sock.sendMessage(jid, { image: { url: res.avatar }, caption: caption }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            } catch (e) {
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 4. PINTEREST STALKER ───
    {
        name: 'pinstalk',
        category: 'stalker',
        description: 'Stalk Pinterest profile',
        usage: '.pinstalk <username>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const input = args.join(" ").trim();
            if (!input) return await sock.sendMessage(jid, { text: '❌ *Provide a username!*\n_Example: .pinstalk Jerry_' }, { quoted: msg });
            
            try {
                await sock.sendMessage(jid, { react: { text: '🔍', key: msg.key } });
                const { data } = await axios.get(`https://jerrycoder.oggyapi.workers.dev/stalk/pin?user=${encodeURIComponent(input)}`, { timeout: 15000 });
                if (data.status !== "success") return await sock.sendMessage(jid, { text: '❌ *User not found!*' }, { quoted: msg });
                
                const res = data.result;
                const imageUrl = res.image || "https://i.pinimg.com/736x/82/38/c7/8238c715971a80d4bd71e72fcda7f2a1.jpg"; 
                const caption = `📌 *PINTEREST STALKER*\n\n📛 *Name:* ${res.name}\n🔹 *Username:* @${res.username}\n👥 *Followers:* ${res.followers}\n👤 *Following:* ${res.following}\n📋 *Boards:* ${res.boards}\n📝 *Bio:* ${res.bio || 'N/A'}\n🔗 *Link:* ${res.profile_url}`;
                
                await sock.sendMessage(jid, { image: { url: imageUrl }, caption: caption }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            } catch (e) {
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 5. INSTAGRAM STALKER ───
    {
        name: 'instastalk',
        alias: ['igstalk'],
        category: 'stalker',
        description: 'Stalk Instagram profile',
        usage: '.instastalk <username>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const input = args.join(" ").trim();
            if (!input) return await sock.sendMessage(jid, { text: '❌ *Provide a username!*\n_Example: .instastalk ohh.itsjerry_' }, { quoted: msg });
            
            try {
                await sock.sendMessage(jid, { react: { text: '🔍', key: msg.key } });
                const { data } = await axios.get(`https://jerrycoder.oggyapi.workers.dev/stalk/insta?user=${encodeURIComponent(input)}`, { timeout: 15000 });
                if (data.status !== "success") return await sock.sendMessage(jid, { text: '❌ *User not found!*' }, { quoted: msg });
                
                const res = data.result;
                const caption = `📸 *INSTAGRAM STALKER*\n\n📛 *Name:* ${res.name || 'N/A'}\n🔹 *Username:* @${res.username}\n👥 *Followers:* ${res.follower}\n👤 *Following:* ${res.following}\n🖼️ *Posts:* ${res.post}\n🔒 *Private:* ${res.private ? 'Yes' : 'No'}\n📝 *Bio:* ${res.about || 'N/A'}\n🔗 *Link:* ${res.profile}`;
                
                await sock.sendMessage(jid, { image: { url: res.photo }, caption: caption }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            } catch (e) {
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 6. GITHUB STALKER ───
    {
        name: 'github',
        alias: ['gitstalk'],
        category: 'stalker',
        description: 'Stalk GitHub profile',
        usage: '.github <username>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const input = args.join(" ").trim();
            if (!input) return await sock.sendMessage(jid, { text: '❌ *Provide a username!*\n_Example: .github torvalds_' }, { quoted: msg });
            
            try {
                await sock.sendMessage(jid, { react: { text: '🔍', key: msg.key } });
                const { data } = await axios.get(`https://jerrycoder.oggyapi.workers.dev/stalk/github?user=${encodeURIComponent(input)}`, { timeout: 15000 });
                if (data.status !== "success") return await sock.sendMessage(jid, { text: '❌ *User not found!*' }, { quoted: msg });
                
                const res = data.result;
                const caption = `🐙 *GITHUB STALKER*\n\n📛 *Name:* ${res.name}\n🔹 *Username:* @${res.username}\n👥 *Followers:* ${res.followers}\n👤 *Following:* ${res.following}\n📁 *Repos:* ${res.public_repo}\n📍 *Location:* ${res.location || 'N/A'}\n📝 *Bio:* ${res.bio || 'N/A'}\n🔗 *Link:* ${res.profile_url}`;
                
                await sock.sendMessage(jid, { image: { url: res.profile }, caption: caption }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            } catch (e) {
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 7. APPLE MUSIC DOWNLOADER ───
    {
        name: 'applem',
        category: 'downloader',
        description: 'Download Apple Music track',
        usage: '.applem <url>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const input = args.join(" ").trim();
            if (!input) return await sock.sendMessage(jid, { text: '❌ *Provide an Apple Music URL!*' }, { quoted: msg });
            
            try {
                await sock.sendMessage(jid, { react: { text: '⬇️', key: msg.key } });
                
                const { data } = await axios.get(`https://jerrycoder.oggyapi.workers.dev/down/applem?url=${encodeURIComponent(input)}`, { timeout: 20000 });
                if (data.status !== "success") return await sock.sendMessage(jid, { text: '❌ *Failed to fetch track!*' }, { quoted: msg });
                
                const res = data.result;
                const audioResponse = await axios.get(res.download, { responseType: 'arraybuffer', timeout: 30000 });
                const audioBuffer = Buffer.from(audioResponse.data);

                await sock.sendMessage(jid, { 
                    audio: audioBuffer, 
                    mimetype: 'audio/mpeg', 
                    ptt: false
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            } catch (e) {
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 8. ANIME QUOTE ───
    {
        name: "animequote",
        alias: ["quote", "aq"],
        category: "fun",
        description: "Get a random anime quote",
        usage: ".quote",
        async execute(sock, msg) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "💬", key: msg.key } });
                const { data } = await axios.get("https://api.rei.my.id/animequotes?limit=20", { timeout: 15000 });
                const quotes = data?.data || data?.results || data;
                
                if (!quotes || quotes.length === 0) throw new Error("No quotes found");
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                
                const caption = `💬 *"${randomQuote.quote || randomQuote.english}"*\n\n👤 *Character:* ${randomQuote.character}\n⛩️ *Anime:* ${randomQuote.anime}`;
                await sock.sendMessage(jid, { text: caption }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 9. JOKE COMMAND ───
    {
        name: "joke",
        category: "fun",
        description: "Get a random joke",
        usage: ".joke",
        async execute(sock, msg) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "😂", key: msg.key } });
                const { data } = await axios.get("https://api.rei.my.id/jokes?limit=15", { timeout: 15000 });
                const jokes = data?.data || data?.results || data;
                
                if (!jokes || jokes.length === 0) throw new Error("No jokes found");
                const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                
                const caption = `🎭 *R A N D O M  J O K E*\n\n${randomJoke.joke || randomJoke.text}`;
                await sock.sendMessage(jid, { text: caption }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: '❌ Something went wrong, please try again later.' }, { quoted: msg });
            }
        }
    },

    // ─── 10. SPOTIFY DOWNLOADER ───
    {
        name: "spotify",
        category: "downloader",
        description: "Spotify Track Downloader",
        usage: ".spotify <url>",
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const url = args.join(" ").trim();

            if (!url || !url.includes("spotify.com")) {
                return sock.sendMessage(jid, { text: "❌ *Usage:* .spotify <spotify link>" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

                const apiUrl = `https://jerrycoder.oggyapi.workers.dev/down/spotify?url=${encodeURIComponent(url)}`;
                const { data } = await axios.get(apiUrl, { timeout: 25000 });

                if (data.status !== "success" || !data.download_link) {
                    throw new Error("Failed to fetch track from API");
                }

                const audioRes = await axios.get(data.download_link, { responseType: 'arraybuffer', timeout: 30000 });
                const audioBuffer = Buffer.from(audioRes.data);

                const title = data.title || "Spotify Track";
                const artist = data.artist || "Unknown Artist";

                await sock.sendMessage(jid, { 
                    audio: audioBuffer, 
                    mimetype: 'audio/mpeg', 
                    ptt: false,
                    fileName: `${title} - ${artist}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: title,
                            body: artist,
                            mediaType: 1,
                            thumbnailUrl: data.thumbnail || "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg",
                            sourceUrl: url,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (e) {
                console.error("Spotify Error:", e.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to download the Spotify track.*" }, { quoted: msg });
            }
        }
    },

    // ─── 11. TERABOX DOWNLOADER ───
    {
        name: "terabox",
        alias: ["tera", "teradl", "tb"],
        category: "downloader",
        description: "Terabox Downloader",
        usage: ".terabox <url>",
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const url = args.join(" ").trim();

            if (!url) {
                return sock.sendMessage(jid, { text: "❌ *Example:*\n.terabox https://1024terabox.com/s/xxxxx" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

                const apis = [
                    `https://jerrycoder.oggyapi.workers.dev/down/terabx?url=${encodeURIComponent(url)}`,
                    `https://jerrycoder.oggyapi.workers.dev/down/terabx-v1?url=${encodeURIComponent(url)}`
                ];

                let data = null;

                for (const api of apis) {
                    try {
                        const res = await axios.get(api, { timeout: 30000 });
                        if (res.data) {
                            data = res.data;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (!data) throw new Error("All APIs failed");

                const file = data?.result?.download || data?.result?.url || data?.result?.dlink || data?.data?.download || data?.data?.url || data?.data?.dlink || data?.url;
                const title = data?.result?.title || data?.data?.title || data?.title || "📦 Terabox File";

                if (!file) throw new Error("No download link found");

                const botNum = sock.user.id.split(":")[0].replace(/[^0-9]/g, "");
                let bName = "KIRA X MD";
                try {
                    bName = typeof getBotName === 'function' ? getBotName(sock) : "KIRA X MD";
                } catch(e) {}

                await sock.sendMessage(jid, {
                    document: { url: file },
                    mimetype: "application/octet-stream",
                    fileName: `${title}.mp4`,
                    caption: `${title}\n\n> *Downloaded by ${bName}*`
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (e) {
                console.error("TERABOX ERROR:", e.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Download Failed*" }, { quoted: msg });
            }
        }
    }
];