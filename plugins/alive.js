// plugins/alive.js - KIRA X MD (Mass Alive & Custom Setter)
const os = require("os");
const fs = require("fs");
const path = require("path");
const { getSettings } = require("../lib/database");

const dbPath = path.join(__dirname, '../alive_db.json');
let customAliveDB = {};
try {
    if (fs.existsSync(dbPath)) {
        customAliveDB = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } else {
        fs.writeFileSync(dbPath, JSON.stringify(customAliveDB, null, 2));
    }
} catch (err) {
    fs.writeFileSync(dbPath, JSON.stringify(customAliveDB, null, 2));
}

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(customAliveDB, null, 2));
}

function toSmallCaps(str) {
    if (!str) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ',
        'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
        'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
        'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return str.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
}

module.exports = [
    {
        name: "alive",
        alias: ["status", "botstatus"],
        category: "main",
        description: "Check bot alive status",

        async execute(sock, msg) {
            const jid = msg.key.remoteJid;
            await sock.sendMessage(jid, { react: { text: "🩸", key: msg.key } });

            const botNumber = sock.user?.id?.split(':')[0]?.replace(/[^0-9]/g, "") || "";
            const config = typeof getSettings === 'function' ? (getSettings(botNumber) || {}) : {};

            const botName = config.botName || process.env.BOT_NAME || "KIRA X MD";
            const ownerName = config.ownerName || process.env.OWNER_NAME || "Madhav";
            const platform = os.platform();

            // Uptime
            const uptime = process.uptime();
            const d = Math.floor(uptime / (3600 * 24));
            const h = Math.floor((uptime % (3600 * 24)) / 3600);
            const m = Math.floor((uptime % 3600) / 60);
            const s = Math.floor(uptime % 60);
            
            let uptimeString = "";
            if (d > 0) uptimeString += `${d} ᴅᴀʏs `;
            if (h > 0) uptimeString += `${h} ʜᴏᴜʀs `;
            if (m > 0) uptimeString += `${m} ᴍɪɴs `;
            uptimeString += `${s} sᴇᴄs`;

            // Default Assets
            const defaultImage = "https://static0.cbrimages.com/wordpress/wp-content/uploads/2023/06/17-most-heartbreaking-deaths-in-death-note-1.jpg";
            const defaultAudio = "https://mp3tourl.com/audio/1790747327921-13a7100f-84af-4ed1-96ea-fe7450417816.mp3";
            const defaultText = `🩸 *${toSmallCaps(botName)} ɪs ᴀʟɪᴠᴇ!*

❖ *ʙᴏᴛ:* ${botName}
❖ *ᴏᴡɴᴇʀ:* ${ownerName}
❖ *ᴜᴘᴛɪᴍᴇ:* ${uptimeString}
❖ *ᴘʟᴀᴛғᴏʀᴍ:* ${toSmallCaps(platform)}

_“I am Justice!”_`;

            // Fetch custom values from DB
            const userDb = customAliveDB[botNumber] || {};
            const finalImage = userDb.image || defaultImage;
            const finalAudio = userDb.audio || defaultAudio;
            
            // Text logic (If user sets custom text, dynamic vars like uptime won't auto-update unless we do a replace, so we just append uptime if custom)
            let finalText = userDb.text || defaultText;
            if (userDb.text && !userDb.text.includes(uptimeString)) {
                finalText += `\n\n⏱️ *Uptime:* ${uptimeString}`;
            }

            // 1. Send Image with Caption
            try {
                await sock.sendMessage(jid, {
                    image: { url: finalImage },
                    caption: finalText,
                    contextInfo: {
                        externalAdReply: {
                            title: "Kɪʀᴀ ~ʜᴇʀᴇ",
                            body: `Uptime: ${uptimeString}`,
                            thumbnailUrl: finalImage,
                            sourceUrl: "https://whatsapp.com/channel/0029Vb87dNXATRSs169S8c1t",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: msg });
            } catch (e) {
                console.error("Alive Image Error", e);
                await sock.sendMessage(jid, { text: finalText }, { quoted: msg });
            }

            // 2. Send Audio (Voice Note)
            try {
                await sock.sendMessage(jid, {
                    audio: { url: finalAudio },
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true,
                    contextInfo: {
                        externalAdReply: {
                            title: "Kɪʀᴀ ~ʜᴇʀᴇ",
                            body: "Alive Status",
                            thumbnailUrl: finalImage,
                            sourceUrl: "https://whatsapp.com/channel/0029Vb87dNXATRSs169S8c1t",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: msg });
            } catch (e) {
                console.error("Alive Audio Error", e);
            }
        }
    },
    {
        name: "setalive",
        alias: ["aliveconfig"],
        category: "owner",
        description: "Set custom text, image, or audio for alive message",
        usage: ".setalive <text> | <image_url> | <audio_url>",

        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;
            if (!isOwner) return await sock.sendMessage(jid, { text: "❌ *Owner only!*" }, { quoted: msg });

            const botNumber = sock.user?.id?.split(':')[0]?.replace(/[^0-9]/g, "") || "";
            let argsStr = args.join(" ").trim();

            if (!argsStr) {
                return await sock.sendMessage(jid, { 
                    text: `⚠️ *Usage Examples:*\n\n1. Set only text:\n*.setalive My custom alive text!*\n\n2. Set only audio:\n*.setalive https://link.mp3*\n\n3. Set everything:\n*.setalive My alive message https://img.jpg https://audio.mp3*\n\n4. Reset to default:\n*.setalive reset*` 
                }, { quoted: msg });
            }

            if (argsStr.toLowerCase() === "reset" || argsStr.toLowerCase() === "default") {
                delete customAliveDB[botNumber];
                saveDB();
                return await sock.sendMessage(jid, { text: "✅ *Alive message restored to default!*" }, { quoted: msg });
            }

            let audioUrl = null;
            let imageUrl = null;
            let customText = "";

            // Smart URL Extraction Regex
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = argsStr.match(urlRegex) || [];

            for (const u of urls) {
                if (u.match(/\.(mp3|ogg|wav|m4a)$/i) || u.includes("audio") || u.includes("mp3tourl")) {
                    audioUrl = u;
                } else if (u.match(/\.(jpe?g|png|gif|webp)$/i) || u.includes("image") || u.includes("cbrimages")) {
                    imageUrl = u;
                } else {
                    if (!imageUrl) imageUrl = u; // Default unknown links to image
                }
            }

            // Extract the remaining text after removing URLs
            customText = argsStr.replace(urlRegex, "").trim();

            // Store in DB
            const currentData = customAliveDB[botNumber] || {};
            if (customText) currentData.text = customText;
            if (audioUrl) currentData.audio = audioUrl;
            if (imageUrl) currentData.image = imageUrl;

            customAliveDB[botNumber] = currentData;
            saveDB();

            let responseMsg = `✅ *Alive Config Updated!*\n\n`;
            if (customText) responseMsg += `📝 *Text:* Updated\n`;
            if (imageUrl) responseMsg += `🖼️ *Image:* Updated\n`;
            if (audioUrl) responseMsg += `🎵 *Audio:* Updated\n`;

            await sock.sendMessage(jid, { text: responseMsg }, { quoted: msg });
        }
    }
];