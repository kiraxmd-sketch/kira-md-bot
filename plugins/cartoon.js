// plugins/cartoon_wasted.js - KIRA X MD (Combined Logo & Editor Plugins)
const axios = require("axios");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// ─── Helper function to upload image to Catbox ───
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
        return res.data; // Returns Catbox URL
    } catch (e) {
        throw new Error("Catbox upload failed.");
    }
}

module.exports = [
    // ==========================================
    // 1. CARTOON STYLE LOGO
    // ==========================================
    {
        name: "cartoon",
        alias: ["cartoonstyle"],
        category: "logo",
        description: "Generate Cartoon Style Text Logo",

        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const text = args.join(" ").trim();

            if (!text) {
                return await sock.sendMessage(jid, {
                    text: `❌ Give some text.\n\nExample:\n.cartoon Kira`
                }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "🎨", key: msg.key } });

                const { data } = await axios.get(
                    `https://jerrycoder.oggyapi.workers.dev/ephoto/cartoonstyle?text=${encodeURIComponent(text)}`,
                    { timeout: 15000 }
                );

                const imageUrl = data.result || data.url || data.image;

                if (!imageUrl) throw new Error("No image URL returned");

                await sock.sendMessage(jid, {
                    image: { url: imageUrl },
                    caption: `🎨 *CARTOON STYLE*\n\n📝 Text: ${text}`
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("CARTOON ERROR:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ Failed to generate cartoon logo." }, { quoted: msg });
            }
        }
    },

    // ==========================================
    // 2. WASTED IMAGE EDITOR
    // ==========================================
    {
        name: "wasted",
        category: "logo",
        description: "Add GTA Wasted overlay to an image",
        usage: ".wasted (reply to an image)",

        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            
            // Check if replying to an image
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = msg.message?.imageMessage || quoted?.imageMessage;
            
            if (!isImage) {
                return await sock.sendMessage(jid, { text: "❌ *Reply to an image to apply the Wasted filter!*" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

                // 1. Download the image
                const mediaMessage = quoted?.imageMessage ? quoted : msg.message;
                const buffer = await downloadMediaMessage({ message: mediaMessage }, 'buffer', {}, { logger: console });
                
                // 2. Upload to Catbox
                const catboxUrl = await uploadToCatbox(buffer);

                // 3. Send to API
                const apiUrl = `https://api.nexray.eu.cc/editor/wasted?url=${encodeURIComponent(catboxUrl)}`;
                
                // The API might return an image buffer directly, so we request arraybuffer
                const apiRes = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });
                const imageBuffer = Buffer.from(apiRes.data);

                // 4. Send back the processed image
                await sock.sendMessage(jid, {
                    image: imageBuffer,
                    caption: "💀 *WASTED*"
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("WASTED ERROR:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to generate Wasted image.*" }, { quoted: msg });
            }
        }
    }
];