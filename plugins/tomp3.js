// plugins/tomp3.js - KIRA X MD (Ultra Fast & Stable Anti-Hang MP3 Converter)
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises"); // RAM ലാഭിക്കാൻ
const { getSettings } = require("../lib/database");

const ffmpegPath = path.join(__dirname, '../ffmpeg.exe');
if (fs.existsSync(ffmpegPath)) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

// 🔥 FFmpeg-ന് സപ്പോർട്ട് ചെയ്യാത്ത ഫാൻസി ഫോണ്ടുകളും സ്പെഷ്യൽ ക്യാരക്ടറുകളും ഒഴിവാക്കാൻ
function sanitizeMetadata(text, fallback) {
    if (!text) return fallback;
    const cleaned = text.replace(/[^\x20-\x7E]/g, '').trim(); 
    return cleaned || fallback;
}

module.exports = {
    name: "tomp3",
    alias: ["mp3", "video2mp3", "toaudio"],
    category: "media",
    description: "Convert replied video to MP3 audio instantly",
    usage: `${process.env.PREFIX || '.'}mp3 (reply to a video)`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // ബോട്ടിന്റെ നമ്പർ എടുക്കുന്നു
        const botNumber = sock.user?.id?.split(':')[0]?.replace(/[^0-9]/g, "") || "";

        // ഡാറ്റാബേസിൽ നിന്നോ .env-ൽ നിന്നോ Dynamic ആയി പേരുകൾ എടുക്കുന്നു
        const settings = typeof getSettings === 'function' ? (getSettings(botNumber) || {}) : {};
        const botName = settings.botName || process.env.BOT_NAME || global.config?.BOT_NAME || 'KIRA X MD';
        const ownerName = settings.ownerName || process.env.OWNER_NAME || global.config?.OWNER_NAME || 'Madhav';

        // Disappearing / ViewOnce മെസ്സേജുകളിൽ നിന്നുള്ള വീഡിയോ കണ്ടെത്തുന്നു
        const videoMessage = quoted?.videoMessage || 
                             quoted?.ephemeralMessage?.message?.videoMessage || 
                             quoted?.viewOnceMessageV2?.message?.videoMessage;

        if (!videoMessage) {
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            return await sock.sendMessage(jid, { text: "❌ *Please reply to a video!*" }, { quoted: msg });
        }

        console.log("⬇️ [toMP3] Starting stable download...");
        await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

        const tempDir = path.join(__dirname, "../temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const ts = Date.now();
        const inputPath = path.join(tempDir, `video_${ts}.mp4`);
        const outputPath = path.join(tempDir, `audio_${ts}.mp3`);

        try {
            // 🔥 1. ANTI-HANG FIX: RAM-ലേക്ക് ലോഡ് ചെയ്യാതെ നേരിട്ട് ഫയലിലേക്ക് എഴുതുന്നു
            const stream = await downloadContentFromMessage(videoMessage, 'video');
            await pipeline(stream, fs.createWriteStream(inputPath));
            
            console.log("✅ [toMP3] Video saved to disk. Starting fast extraction...");

            const safeBotName = sanitizeMetadata(botName, "KIRA X MD");
            const safeOwnerName = sanitizeMetadata(ownerName, "Madhav");

            // 🔥 2. ULTRA-FAST FIX: വീഡിയോ സ്ട്രീം പൂർണ്ണമായും ഒഴിവാക്കി ഓഡിയോ മാത്രം എടുക്കുന്നു
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .noVideo() // <--- THE BIGGEST SPEED HACK
                    .toFormat("mp3")
                    .audioBitrate("128k")
                    .outputOptions([
                        '-metadata', `title=${safeBotName}`, 
                        '-metadata', `artist=${safeOwnerName}`,    
                        '-metadata', `album=${safeBotName}`
                    ])
                    .on("end", () => {
                        console.log("✅ [toMP3] Conversion finished instantly!");
                        resolve();
                    })
                    .on("error", (err) => {
                        console.error("❌ [toMP3] FFmpeg Error:", err.message);
                        reject(new Error(`FFmpeg crashed: ${err.message}`));
                    })
                    .save(outputPath);
            });

            const audioBuffer = fs.readFileSync(outputPath);
            console.log("📤 [toMP3] Sending Audio to WhatsApp...");
            
            await sock.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: "audio/mp4", // WhatsApp officially uses this for some mp3s
                ptt: false, 
                fileName: `${safeBotName.replace(/\s+/g, '_')}_${ts}.mp3`,
            }, { quoted: msg }); 

            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            console.log("🎉 [toMP3] Process completed successfully!");
            
        } catch (err) {
            console.error("❌ [toMP3] Master Error:", err.message);
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            await sock.sendMessage(jid, { 
                text: `❌ *Error processing video!*\n\n_Reason: ${err.message}_` 
            }, { quoted: msg });
            
        } finally {
            // കാഷെ ക്ലിയർ ചെയ്യുന്നു
            try {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (e) {}
        }
    }
};