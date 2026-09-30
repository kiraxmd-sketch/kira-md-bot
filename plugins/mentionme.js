// plugins/mentionme.js – KIRA X MD
// Trigger: @all + individual bot mention
// Feature: Random default audios + Custom audio support + Custom Thumbnails

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const { getSettings, updateSetting } = require('../lib/database');

const DEFAULT_AUDIO_LIST = [
    "https://files.catbox.moe/mpv0vj.mp3",
    "https://files.catbox.moe/j7l9rc.mp3",
    "https://files.catbox.moe/sx46pc.mp3",
    "https://mp3tourl.com/audio/1790747149382-ef5edbc0-20f5-4946-bc92-3c60c9cdf853.mp3",
    "https://mp3tourl.com/audio/1790747327921-13a7100f-84af-4ed1-96ea-fe7450417816.mp3"
];

const GENERAL_THUMBNAILS = [
    "https://i.pinimg.com/236x/90/f3/28/90f3281956d774d19f9ea9c193c8c453.jpg",
    "https://i.pinimg.com/236x/b6/d0/e2/b6d0e27c5e462a84e4cb1722d03b440e.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSszTgpJQveLk5uEgO-LtR2LA4IP9FJXRuwi9ypeAZAfgGasuPmdgPBhilE&s=10"
];

const SPECIAL_THUMBNAILS = [
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ba25e001-a543-4ca0-950e-9db3bf6cbdae/df1uz67-8e492aac-7fd7-4b2e-8b5e-5d68b0d0f65d.jpg",
    "https://static0.cbrimages.com/wordpress/wp-content/uploads/2023/06/17-most-heartbreaking-deaths-in-death-note-1.jpg"
];

// ഡാറ്റാബേസ് പാത്ത് ഫോർ കസ്റ്റം ലിങ്ക്
const dbPath = path.join(__dirname, '../mention_db.json');
let customAudioDB = {};
try {
    if (fs.existsSync(dbPath)) {
        customAudioDB = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } else {
        fs.writeFileSync(dbPath, JSON.stringify(customAudioDB, null, 2));
    }
} catch (err) {
    fs.writeFileSync(dbPath, JSON.stringify(customAudioDB, null, 2));
}

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(customAudioDB, null, 2));
}

module.exports = [
    {
        name: 'mentionme',
        alias: ['maudio', 'tagaudio'],
        category: 'owner',
        description: 'Toggle audio when bot is mentioned',
        usage: `.mentionme on/off`,

        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;

            if (!isOwner) {
                return await sock.sendMessage(jid, { text: '❌ *Owner only command!*' }, { quoted: msg });
            }

            const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
            const config = getSettings(botNumber);
            const action = (args?.[0] || '').toLowerCase();

            if (action === 'on') {
                updateSetting(botNumber, 'mentionMe', true);
                return await sock.sendMessage(jid, { text: '✅ *Mention Audio ON*' }, { quoted: msg });
            }

            if (action === 'off') {
                updateSetting(botNumber, 'mentionMe', false);
                return await sock.sendMessage(jid, { text: '❌ *Mention Audio OFF*' }, { quoted: msg });
            }

            const status = config.mentionMe ? '🟢 ON' : '🔴 OFF';
            const currentCustom = customAudioDB[botNumber] ? 'Active' : 'Not Set (Using Defaults)';

            return await sock.sendMessage(
                jid,
                {
                    text:
`🎤 *MENTION AUDIO*

➤ .mentionme on
➤ .mentionme off

Status: ${status}
Custom Audio: ${currentCustom}

*To set a custom mention audio:*
➤ .mentionmeset <audio link>
*To reset to default audios:*
➤ .mentionmeset reset

_Triggers only when the bot is personally mentioned or @all is used._`
                },
                { quoted: msg }
            );
        }
    },
    {
        name: 'mentionmeset',
        alias: ['setmaudio'],
        category: 'owner',
        description: 'Set a custom audio link for mention',
        usage: `.mentionmeset <mp3 link> | reset`,

        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;

            if (!isOwner) {
                return await sock.sendMessage(jid, { text: '❌ *Owner only command!*' }, { quoted: msg });
            }

            const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
            const link = (args.join(' ') || '').trim();

            if (!link) {
                return await sock.sendMessage(jid, { text: '❌ *Please provide an audio link!*\n\nExample:\n.mentionmeset https://url.com/song.mp3\n.mentionmeset reset' }, { quoted: msg });
            }

            if (link.toLowerCase() === 'reset') {
                delete customAudioDB[botNumber];
                saveDB();
                return await sock.sendMessage(jid, { text: '✅ *Custom mention audio removed! Now using random default audios.*' }, { quoted: msg });
            }

            if (!link.startsWith('http')) {
                return await sock.sendMessage(jid, { text: '❌ *Invalid URL! Please provide a valid direct audio link.*' }, { quoted: msg });
            }

            customAudioDB[botNumber] = link;
            saveDB();

            return await sock.sendMessage(jid, { text: `✅ *Custom Mention Audio Set Successfully!*\n🔗 Link: ${link}` }, { quoted: msg });
        }
    }
];

// ─────────────────────────────────────────────
// 🎤 MENTION AUDIO EVENT
// ─────────────────────────────────────────────

async function initMentionMe(sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages?.[0];

            if (!msg?.message) return;
            if (msg.key?.fromMe) return;

            const jid = msg.key.remoteJid;

            // Group only
            if (!jid || !jid.endsWith('@g.us')) return;

            const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
            const config = getSettings(botNumber);

            // Feature OFF
            if (!config.mentionMe) return;

            // Ignore commands
            const text = msg.message?.conversation ||
                         msg.message?.extendedTextMessage?.text ||
                         msg.message?.imageMessage?.caption ||
                         msg.message?.videoMessage?.caption || '';

            const prefix = process.env.PREFIX || '.';

            if (text.trim().startsWith(prefix)) return;

            const botJid = `${botNumber}@s.whatsapp.net`;
            const botLid = `${botNumber}@lid`;

            const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                                msg.message?.imageMessage?.contextInfo ||
                                msg.message?.videoMessage?.contextInfo ||
                                msg.message?.documentMessage?.contextInfo || {};

            const mentionedJid = contextInfo.mentionedJid || [];

            let isBotMentioned = false;

            for (const mentioned of mentionedJid) {
                if (mentioned === botJid || mentioned === botLid) {
                    isBotMentioned = true;
                    break;
                }
                const mentionedNumber = mentioned.split('@')[0].replace(/[^0-9]/g, '');
                if (mentionedNumber === botNumber) {
                    isBotMentioned = true;
                    break;
                }
            }

            const lowerText = text.toLowerCase();
            const isAllMention = lowerText.includes('@all') || lowerText.includes('@everyone');

            if (!isBotMentioned && !isAllMention) return;

            console.log(`🎤 Mention detected for +${botNumber}`);

            // Fetch custom audio if set, otherwise random from default
            let finalAudioUrl = customAudioDB[botNumber];
            let audioIndex = -1;

            if (!finalAudioUrl) {
                audioIndex = Math.floor(Math.random() * DEFAULT_AUDIO_LIST.length);
                finalAudioUrl = DEFAULT_AUDIO_LIST[audioIndex];
            }

            // Determine Thumbnail based on audio index
            let thumbUrl = GENERAL_THUMBNAILS[Math.floor(Math.random() * GENERAL_THUMBNAILS.length)];
            if (audioIndex === 3 || audioIndex === 4) {
                thumbUrl = SPECIAL_THUMBNAILS[Math.floor(Math.random() * SPECIAL_THUMBNAILS.length)];
            }

            await sock.sendPresenceUpdate('recording', jid);

            const timestamp = Date.now();
            const tempMp3 = path.join(process.cwd(), `mention_${timestamp}.mp3`);
            const tempOgg = path.join(process.cwd(), `mention_${timestamp}.ogg`);

            try {
                // Download MP3
                const audioRes = await axios.get(finalAudioUrl, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });

                fs.writeFileSync(tempMp3, Buffer.from(audioRes.data));

                // Convert MP3 → OGG/OPUS
                const ffmpegCmd = `ffmpeg -y -i "${tempMp3}" -c:a libopus -b:a 48k -vbr on -compression_level 10 -frame_duration 20 -application voip "${tempOgg}"`;

                await new Promise((resolve, reject) => {
                    exec(ffmpegCmd, (error, stdout, stderr) => {
                        if (error) {
                            console.error('FFmpeg error:', stderr || error.message);
                            return reject(error);
                        }
                        resolve();
                    });
                });

                // Read converted audio
                const audioBuffer = fs.readFileSync(tempOgg);

                // Send voice note with Ad Reply Thumbnail
                await sock.sendMessage(
                    jid,
                    {
                        audio: audioBuffer,
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true,
                        contextInfo: {
                            externalAdReply: {
                                title: "Kɪʀᴀ ~ʜᴇʀᴇ",
                                body: "",
                                mediaType: 1,
                                thumbnailUrl: thumbUrl,
                                sourceUrl: "https://whatsapp.com/channel/0029Vb87dNXATRSs169S8c1t",
                                renderLargerThumbnail: true
                            }
                        }
                    },
                    { quoted: msg }
                );

            } catch (error) {
                console.error('❌ Mention audio error:', error.message);
            } finally {
                // Cleanup
                try {
                    if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
                    if (fs.existsSync(tempOgg)) fs.unlinkSync(tempOgg);
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError.message);
                }
            }

        } catch (error) {
            console.error('MentionMe event error:', error.message);
        }
    });
}

module.exports.initMentionMe = initMentionMe;