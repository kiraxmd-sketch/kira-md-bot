// plugins/find.js - KIRA X MD (Advanced Find with API + Shazam Fallback)
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { Shazam } = require("node-shazam");

// ─── HELPER: Upload Buffer to Catbox to get a Direct URL ───
async function uploadBuffer(buffer, mimeType) {
    try {
        const ext = mimeType.split('/')[1]?.split(';')[0] || 'mp4';
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: `media.${ext}` });
        
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            timeout: 20000 // 20 സെക്കൻഡ് ടൈംഔട്ട്
        });
        return res.data; // ഇത് ഒരു URL തരും
    } catch (e) {
        return null;
    }
}

module.exports = {
    name: "find",
    alias: ["identify", "whatsong", "shazam"],
    category: "media",
    description: "Identify song from replied audio/video using Advanced API",
    usage: `${process.env.PREFIX || '.'}find (reply to audio/video)`,

    async execute(sock, msg) {
        const jid = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted || (!quoted.audioMessage && !quoted.videoMessage)) {
            return await sock.sendMessage(jid, { 
                text: `❌ *Media missing!*\n➢ Reply to an Audio or Video.` 
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { react: { text: "🎧", key: msg.key } });

            // 1. Download Media Buffer from WhatsApp
            const mediaType = quoted.audioMessage ? "audio" : "video";
            const mime = quoted.audioMessage?.mimetype || quoted.videoMessage?.mimetype;
            const mediaBuffer = await downloadMediaMessage({ message: quoted }, "buffer", {}, {});
            
            if (!mediaBuffer) throw new Error("Failed to download media buffer");
            
            // 2. Save Temp File for Shazam fallback
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            
            const tmpPath = path.join(tempDir, `find_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'mp3'}`);
            fs.writeFileSync(tmpPath, mediaBuffer);

            let songData = null;

            // 3. 🚀 PRIMARY METHOD: Catbox Upload -> Advanced API
            try {
                const uploadedUrl = await uploadBuffer(mediaBuffer, mime);
                if (uploadedUrl) {
                    const apiUrl = `https://jerrycoder.oggyapi.workers.dev/tool/identify?url=${encodeURIComponent(uploadedUrl)}`;
                    const res = await axios.get(apiUrl, { timeout: 25000 });
                    
                    if (res.data?.status === "success" && res.data?.result) {
                        const r = res.data.result;
                        songData = {
                            title: r.title || "Unknown",
                            artist: r.artist || "Unknown",
                            album: r.Album || "Unknown",
                            released: r["Released on"] || "Unknown",
                            duration: r.Duration || "Unknown",
                            label: r.Label || "Unknown",
                            genre: r.Genres || "Unknown",
                            image: r.image || "https://i.pinimg.com/736x/8f/3e/eb/8f3eeb0c1097bd5a3a0eec26f1c71285.jpg",
                            link: r.shazam_url || "Not Found"
                        };
                    }
                }
            } catch (apiErr) {
                console.log("Primary API failed, falling back to node-shazam...");
            }

            // 4. 🔄 FALLBACK METHOD: node-shazam NPM package
            if (!songData) {
                try {
                    const shazam = new Shazam();
                    const res = await shazam.recognise(tmpPath);
                    if (res && res.track) {
                        const track = res.track;
                        songData = {
                            title: track.title || "Unknown",
                            artist: track.subtitle || "Unknown",
                            album: "Unknown",
                            released: "Unknown",
                            duration: "Unknown",
                            label: "Unknown",
                            genre: track.genres?.primary || "Unknown",
                            image: track.images?.coverart || "https://i.pinimg.com/736x/8f/3e/eb/8f3eeb0c1097bd5a3a0eec26f1c71285.jpg",
                            link: track.share?.href || "Not Found"
                        };
                    }
                } catch (fallbackErr) {
                    console.log("Fallback Shazam also failed:", fallbackErr.message);
                }
            }

            // Delete the temp file (Cleanup)
            try { fs.unlinkSync(tmpPath); } catch(e) {}

            if (!songData) {
                throw new Error("Song not recognized");
            }

            // 5. FORMAT OUTPUT (Style 2: Small Caps)
            let caption = `🎧 ꜱᴏɴɢ ɪᴅᴇɴᴛɪꜰɪᴇᴅ 🎧\n\n`;
            caption += `◈ ᴛɪᴛʟᴇ    : ${songData.title}\n`;
            caption += `◈ ᴀʀᴛɪꜱᴛ   : ${songData.artist}\n`;
            
            if (songData.album !== "Unknown") caption += `◈ ᴀʟʙᴜᴍ    : ${songData.album}\n`;
            if (songData.released !== "Unknown") caption += `◈ ʀᴇʟᴇᴀꜱᴇᴅ : ${songData.released}\n`;
            if (songData.duration !== "Unknown") caption += `◈ ᴅᴜʀᴀᴛɪᴏɴ : ${songData.duration}\n`;
            if (songData.label !== "Unknown") caption += `◈ ʟᴀʙᴇʟ    : ${songData.label}\n`;
            if (songData.genre !== "Unknown" && songData.genre !== "NotFound") caption += `◈ ɢᴇɴʀᴇ    : ${songData.genre}\n`;
            
            caption += `\n🔗 ʟɪꜱᴛᴇɴ   : ${songData.link}`;

            // 6. SEND RESULT
            await sock.sendMessage(jid, { 
                image: { url: songData.image }, 
                caption 
            }, { quoted: msg });
            
            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

        } catch (err) {
            console.error("Find Error:", err.message); 
            await sock.sendMessage(jid, { 
                text: `❌ *Failed to identify.*\n_Song not recognized or unsupported format._` 
            }, { quoted: msg });
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        }
    }
};