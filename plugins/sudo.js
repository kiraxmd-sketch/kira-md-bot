// plugins/sudo.js - KIRA X MD (Sudo Management Fix)
const fs = require('fs');
const path = require('path');

const sudoFile = path.join(process.cwd(), 'sudo.json');

// 🔥 Helper to strictly format JID
function formatJid(rawJid) {
    if (!rawJid) return null;
    const num = rawJid.split('@')[0].replace(/[^0-9]/g, '');
    return num ? `${num}@s.whatsapp.net` : null;
}

const getSudo = () => {
    if (!fs.existsSync(sudoFile)) fs.writeFileSync(sudoFile, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(sudoFile));
};

module.exports = [
    // ─── 1. ADD SUDO ───
    {
        name: 'addsudo',
        category: 'owner',
        description: 'Add a user to sudo list',
        usage: '.addsudo @user or reply',
        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;
            
            // Only Main Owner
            if (!isOwner) return await sock.sendMessage(jid, { text: '❌ *This command is for the Owner only!*' }, { quoted: msg });

            // Extract Target
            let rawTarget = msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (!rawTarget && args[0]) {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
                rawTarget = mentioned && mentioned.length > 0 ? mentioned[0] : args[0];
            }
            
            const target = formatJid(rawTarget);
            
            if (!target) return await sock.sendMessage(jid, { text: '❌ *Please reply to a user or mention their number!*\n_Example: .addsudo @user_' }, { quoted: msg });

            let sudoList = getSudo();
            if (sudoList.includes(target)) {
                return await sock.sendMessage(jid, { text: '⚠️ *This user is already a Sudo member!*' }, { quoted: msg });
            }

            sudoList.push(target);
            fs.writeFileSync(sudoFile, JSON.stringify(sudoList, null, 2));

            await sock.sendMessage(jid, { text: `✅ *Successfully added @${target.split('@')[0]} to Sudo List!*\n_They can now use owner commands._`, mentions: [target] }, { quoted: msg });
        }
    },

    // ─── 2. DEL SUDO ───
    {
        name: 'delsudo',
        category: 'owner',
        description: 'Remove a user from sudo list',
        usage: '.delsudo @user or reply',
        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;
            if (!isOwner) return await sock.sendMessage(jid, { text: '❌ *This command is for the Owner only!*' }, { quoted: msg });

            let rawTarget = msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (!rawTarget && args[0]) {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
                rawTarget = mentioned && mentioned.length > 0 ? mentioned[0] : args[0];
            }
            
            const target = formatJid(rawTarget);
            
            if (!target) return await sock.sendMessage(jid, { text: '❌ *Please reply to a user or mention their number!*' }, { quoted: msg });

            let sudoList = getSudo();
            if (!sudoList.includes(target)) {
                return await sock.sendMessage(jid, { text: '⚠️ *This user is not in the Sudo list!*' }, { quoted: msg });
            }

            sudoList = sudoList.filter(id => id !== target);
            fs.writeFileSync(sudoFile, JSON.stringify(sudoList, null, 2));

            await sock.sendMessage(jid, { text: `✅ *Successfully removed @${target.split('@')[0]} from Sudo List!*`, mentions: [target] }, { quoted: msg });
        }
    },

    // ─── 3. SUDO LIST ───
    {
        name: 'sudolist',
        category: 'owner',
        description: 'View all sudo members',
        usage: '.sudolist',
        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;
            const sudoList = getSudo();

            if (sudoList.length === 0) {
                return await sock.sendMessage(jid, { text: 'ℹ️ *Sudo list is currently empty.*' }, { quoted: msg });
            }

            let text = `👑 *${global.config?.BOT_NAME || 'KIRA X MD'} SUDO LIST* 👑\n\n`;
            sudoList.forEach((num, index) => {
                text += `${index + 1}. @${num.split('@')[0]}\n`;
            });
            text += `\n> *Total Sudo Users: ${sudoList.length}*`;

            await sock.sendMessage(jid, { text: text, mentions: sudoList }, { quoted: msg });
        }
    }
];