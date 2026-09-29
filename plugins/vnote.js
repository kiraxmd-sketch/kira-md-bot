const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

// FFmpeg Path Setup (Same as your play.js)
const ffmpegPath = path.join(__dirname, '../ffmpeg.exe');
if (fs.existsSync(ffmpegPath)) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

module.exports = {
    name: "vnote",
    alias: ["vn", "ptt", "voicenote"],
    category: "utility",
    description: "Convert Audio/Video to a Perfect Voice Note (PTT)",
    usage: `${process.env.PREFIX || '.'}vnote (Reply to Audio or Video)`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Reply to an Audio or Video file!*" 
            }, { quoted: msg });
        }

        const mime = Object.keys(quoted)[0];
        
        if (!['audioMessage', 'videoMessage', 'documentMessage'].includes(mime)) {
            return await sock.sendMessage(jid, { 
                text: "❌ *Unsupported format! Reply to an Audio or Video.*" 
            }, { quoted: msg });
        }

        // KIRA X MD - Reaction Only Loading
        await sock.sendMessage(jid, { react: { text: "🎙️", key: msg.key } });

        let inputPath, outputPath;

        try {
            // Fix for Baileys msgType
            const msgType = mime === 'audioMessage' ? 'audio' : mime === 'videoMessage' ? 'video' : 'document';
            const stream = await downloadContentFromMessage(quoted[mime], msgType);
            
            const tempDir = path.join(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            inputPath = path.join(tempDir, `input_${Date.now()}`);
            outputPath = path.join(tempDir, `vnote_${Date.now()}.ogg`);

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            fs.writeFileSync(inputPath, buffer);

            // 🔥 FFmpeg settings perfectly tuned for WhatsApp PTT
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .noVideo() // CRITICAL: Removes video streams to prevent corruption error
                    .audioCodec('libopus')
                    .audioBitrate('128k')
                    .audioChannels(1) // Mono audio (standard for WhatsApp)
                    .audioFrequency(48000) // 48kHz (required for standard PTT)
                    .toFormat('ogg')
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });

            const audioBuffer = fs.readFileSync(outputPath);

            // Create a realistic-looking waveform
            const dummyWaveform = new Uint8Array(64);
            for (let i = 0; i < 64; i++) {
                dummyWaveform[i] = Math.floor(Math.random() * 100);
            }

            await sock.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true,
                waveform: dummyWaveform
            }, { quoted: msg });

            // Success Reaction
            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

        } catch (error) {
            console.error("VNOTE Error:", error);
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            await sock.sendMessage(jid, { 
                text: "❌ *Conversion failed! Something went wrong during processing.*" 
            }, { quoted: msg });
        } finally {
            // 🔥 Safe Cleanup to prevent server storage from filling up
            try {
                if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (cleanupError) {}
        }
    }
};
