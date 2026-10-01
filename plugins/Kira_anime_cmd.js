// plugins/Kira_anime_cmd.js - KIRA X MD (Anime Reaction & Maker Commands)
const axios = require('axios');

module.exports = [
    {
        name: 'neko',
        category: 'anime',
        description: 'Random Neko anime image',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=neko`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Random Neko*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Random Neko*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("neko Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'shinobu',
        category: 'anime',
        description: 'Random Shinobu anime image',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=shinobu`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Shinobu Oshino*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Shinobu Oshino*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("shinobu Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'megumin',
        category: 'anime',
        description: 'Random Megumin anime image',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=megumin`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Megumin*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Megumin*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("megumin Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'bully',
        category: 'anime',
        description: 'Random bully anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=bully`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Bully Reaction*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Bully Reaction*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("bully Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'cuddle',
        category: 'anime',
        description: 'Random cuddle anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=cuddle`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Cuddle*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Cuddle*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("cuddle Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'cry',
        category: 'anime',
        description: 'Random cry anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=cry`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Cry*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Cry*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("cry Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'awoo',
        category: 'anime',
        description: 'Random awoo anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=awoo`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Awoo*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Awoo*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("awoo Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'lick',
        category: 'anime',
        description: 'Random lick anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=lick`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Lick*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Lick*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("lick Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'pat',
        category: 'anime',
        description: 'Random pat anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=pat`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Pat*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Pat*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("pat Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'smug',
        category: 'anime',
        description: 'Random smug anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=smug`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Smug*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Smug*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("smug Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'bonk',
        category: 'anime',
        description: 'Random bonk anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=bonk`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Bonk*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Bonk*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("bonk Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'yeet',
        category: 'anime',
        description: 'Random yeet anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=yeet`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Yeet*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Yeet*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("yeet Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'blush',
        category: 'anime',
        description: 'Random blush anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=blush`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Blush*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Blush*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("blush Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'smile',
        category: 'anime',
        description: 'Random smile anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=smile`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Smile*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Smile*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("smile Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'highfive',
        category: 'anime',
        description: 'Random highfive anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=highfive`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Highfive*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Highfive*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("highfive Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'handhold',
        category: 'anime',
        description: 'Random handhold anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=handhold`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Handhold*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Handhold*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("handhold Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'nom',
        category: 'anime',
        description: 'Random nom anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=nom`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Nom*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Nom*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("nom Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'bite',
        category: 'anime',
        description: 'Random bite anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=bite`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Bite*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Bite*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("bite Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'glomp',
        category: 'anime',
        description: 'Random glomp anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=glomp`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Glomp*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Glomp*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("glomp Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'slap',
        category: 'anime',
        description: 'Random slap anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=slap`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Slap*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Slap*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("slap Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'kill',
        category: 'anime',
        description: 'Random kill anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=kill`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Kill*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Kill*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("kill Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'happy',
        category: 'anime',
        description: 'Random happy anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=happy`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Happy*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Happy*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("happy Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'wink',
        category: 'anime',
        description: 'Random wink anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=wink`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Wink*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Wink*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("wink Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'poke',
        category: 'anime',
        description: 'Random poke anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=poke`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Poke*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Poke*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("poke Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'dance',
        category: 'anime',
        description: 'Random dance anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=dance`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Dance*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Dance*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("dance Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
    {
        name: 'cringe',
        category: 'anime',
        description: 'Random cringe anime reaction',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                const apiRes = await axios.get(`https://api.nexray.eu.cc/random/anime?type=cringe`, { timeout: 10000 });
                const mediaUrl = apiRes.data?.result || apiRes.data?.url;
                if (!mediaUrl) throw new Error("No URL");

                const bufferRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const mediaBuffer = Buffer.from(bufferRes.data);

                if (mediaUrl.endsWith('.gif') || mediaUrl.includes('gif')) {
                    await sock.sendMessage(jid, { video: mediaBuffer, gifPlayback: true, caption: `🌸 *Anime Cringe*` }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { image: mediaBuffer, caption: `🌸 *Anime Cringe*` }, { quoted: msg });
                }
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            } catch (err) {
                console.error("cringe Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to fetch image.*" }, { quoted: msg });
            }
        }
    },
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
                
                // Fetch Image Buffer directly for bratanime
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