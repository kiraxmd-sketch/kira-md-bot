const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// ─── Helper function for Vocal Remover (Uploads to Catbox) ───
async function uploadToCatbox(buffer, isVideo) {
    try {
        const FormData = require('form-data');
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, isVideo ? 'media.mp4' : 'media.mp3');
        
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });
        return res.data;
    } catch (e) {
        throw new Error("Catbox upload failed.");
    }
}

// ─── Main Audio Processing Logic for Vocal/Instrumental ───
async function processAudio(sock, msg, args, type) {
    const jid = msg.key.remoteJid;
    let url = args.join(' ').trim();
    
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let mediaMessage = null;
    let isVideo = false;

    if (quoted?.audioMessage || quoted?.videoMessage) {
        mediaMessage = quoted;
        isVideo = !!quoted.videoMessage;
    } else if (msg.message?.audioMessage || msg.message?.videoMessage) {
        mediaMessage = msg.message;
        isVideo = !!msg.message.videoMessage;
    }

    if (!url && !mediaMessage) {
        return await sock.sendMessage(jid, { text: `❌ *Reply to an audio/video or provide a URL!*` }, { quoted: msg });
    }

    try {
        await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
        const statusMsg = await sock.sendMessage(jid, { text: "⏳ *Processing Audio...*\n_This takes around 30 seconds. Please wait!_" }, { quoted: msg });

        let targetUrl = url;
        if (!url || !url.startsWith("http")) {
            const buffer = await downloadMediaMessage({ message: mediaMessage }, 'buffer', {}, { logger: console });
            targetUrl = await uploadToCatbox(buffer, isVideo);
        }

        const apiRes = await axios.get(`https://api.nexray.eu.cc/tools/removevokal?url=${encodeURIComponent(targetUrl)}`);
        if (!apiRes.data?.status || !apiRes.data?.result) throw new Error("API failed");

        const { vocal, instrumental } = apiRes.data.result;

        if (type === 'vocal' || type === 'both') {
            await sock.sendMessage(jid, {
                audio: { url: vocal },
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: 'Vocal.mp3',
                contextInfo: { externalAdReply: { title: "🎤 Vocal Track", body: "KIRA X MD", mediaType: 1, thumbnailUrl: "https://files.catbox.moe/22x0j5.jpeg", renderLargerThumbnail: true } }
            }, { quoted: msg });
        }

        if (type === 'instrumental' || type === 'both') {
            await sock.sendMessage(jid, {
                audio: { url: instrumental },
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: 'Instrumental.mp3',
                contextInfo: { externalAdReply: { title: "🎸 Instrumental Track", body: "KIRA X MD", mediaType: 1, thumbnailUrl: "https://files.catbox.moe/22x0j5.jpeg", renderLargerThumbnail: true } }
            }, { quoted: msg });
        }

        await sock.sendMessage(jid, { delete: statusMsg.key });
        await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        await sock.sendMessage(jid, { text: `❌ *Failed to process audio!*` }, { quoted: msg });
    }
}

// ─── COMBINED MODULE EXPORTS ───
module.exports = [
    // 1. MUTE COMMAND
    {
        name: 'mute',
        alias: ['close', 'lock'],
        category: 'group',
        description: 'Mute the group (Only admins can send messages)',
        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: "❌ *This command can only be used in groups!*" }, { quoted: msg });

            // 🚨 Admin Check (Device code suffix fixed)
            const senderRaw = msg.key.participant || msg.key.remoteJid;
            const senderNum = senderRaw.split('@')[0].split(':')[0];
            const groupMetadata = await sock.groupMetadata(jid);
            const isAdmin = groupMetadata.participants.some(p => p.id.split('@')[0].split(':')[0] === senderNum && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (!isAdmin && !isOwner) return await sock.sendMessage(jid, { text: "❌ *Group Admins only!*" }, { quoted: msg });

            try {
                await sock.groupSettingUpdate(jid, 'announcement');
                await sock.sendMessage(jid, { text: "🔒 *Group Muted! Only Admins can send messages.*" }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "❌ *Failed! Make sure the bot is an admin.*" }, { quoted: msg });
            }
        }
    },
    // 2. UNMUTE COMMAND (Bonus)
    {
        name: 'unmute',
        alias: ['open', 'unlock'],
        category: 'group',
        description: 'Unmute the group (Everyone can send messages)',
        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: "❌ *This command can only be used in groups!*" }, { quoted: msg });

            const senderRaw = msg.key.participant || msg.key.remoteJid;
            const senderNum = senderRaw.split('@')[0].split(':')[0];
            const groupMetadata = await sock.groupMetadata(jid);
            const isAdmin = groupMetadata.participants.some(p => p.id.split('@')[0].split(':')[0] === senderNum && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (!isAdmin && !isOwner) return await sock.sendMessage(jid, { text: "❌ *Group Admins only!*" }, { quoted: msg });

            try {
                await sock.groupSettingUpdate(jid, 'not_announcement');
                await sock.sendMessage(jid, { text: "🔓 *Group Unmuted! Everyone can send messages.*" }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "❌ *Failed! Make sure the bot is an admin.*" }, { quoted: msg });
            }
        }
    },
    // 3. VOCAL COMMAND
    {
        name: 'vocal',
        alias: ['extractvocal'],
        category: 'media',
        description: 'Extract vocals from audio/video',
        async execute(sock, msg, args) {
            await processAudio(sock, msg, args, 'vocal');
        }
    },
    // 4. INSTRUMENTAL COMMAND
    {
        name: 'instrumental',
        alias: ['karaoke'],
        category: 'media',
        description: 'Extract instrumental from audio/video',
        async execute(sock, msg, args) {
            await processAudio(sock, msg, args, 'instrumental');
        }
    }
];