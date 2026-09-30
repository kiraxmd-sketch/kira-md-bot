// plugins/alive.js - KIRA X MD (Single Message Mass Alive)
const os = require("os");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
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
            // 🔥 Using Catbox for direct reliable audio stream
            const defaultAudio = "https://files.catbox.moe/19g98r.mp3"; 

            const defaultText = `🩸 *${toSmallCaps(botName)} ɪs ᴀʟɪᴠᴇ!*

❖ *ʙᴏᴛ:* ${botName}
❖ *ᴏᴡɴᴇʀ:* ${ownerName}
❖ *ᴜᴘᴛɪᴍᴇ:* ${uptimeString}
❖ *ᴘʟᴀᴛғᴏʀᴍ:* ${toSmallCaps(platform)}

_“I am Justice!”_`;

            // Fetch custom values from DB
            const userDb = customAliveDB[botNumber] || {};
            const finalImage = userDb.image || defaultImage;
            const finalAudioUrl = userDb.audio || defaultAudio;
            
            let finalText = userDb.text || defaultText;
            if (userDb.text && !userDb.text.includes(uptimeString)) {
                finalText += `\n\n⏱️ *Uptime:* ${uptimeString}`;
            }

            try {
                // 🔥 "Audio not available" error fix: Download audio as buffer first
                const audioRes = await axios.get(finalAudioUrl, { responseType: 'arraybuffer', timeout: 20000 });
                const audioBuffer = Buffer.from(audioRes.data);

                // 🔥 Send as a single message: Audio + AdReply (Thumbnail) + Caption
                await sock.sendMessage(jid, {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg", 
                    ptt: false, // Set to false to show as an audio file with a proper thumbnail above it
                    contextInfo: {
                        externalAdReply: {
                            title: "Kɪʀᴀ ~ʜᴇʀᴇ",
                            body: finalText, // Put the full alive text inside the AdReply body!
                            thumbnailUrl: finalImage,
                            sourceUrl: "https://whatsapp.com/channel/0029Vb87dNXATRSs169S8c1t", // Your channel link
                            mediaType: 1, // 1 for Image
                            renderLargerThumbnail: true // Makes the image big above the audio
                        }
                    }
                }, { quoted: msg });

            } catch (e) {
                console.error("Alive Single Message Error", e);
                // Fallback if audio fails: just send the image and text
                await sock.sendMessage(jid, {
                    image: { url: finalImage },
                    caption: finalText
                }, { quoted: msg });
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
                if (u.match(/\.(mp3|ogg|wav|m4a)$/i) || u.includes("audio") || u.includes("catbox") || u.includes("mp3tourl")) {
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