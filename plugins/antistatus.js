// plugins/antistatus.js - KIRA X MD
const { getSettings, updateSetting } = require('../lib/database');

module.exports = {
    name: "antistatus",
    alias: ["antistatusmention", "asm"],
    category: "owner",
    description: "Manage Anti-Status Mention (Owner Only)",

    async execute(sock, msg, args, isOwner) {
        const jid = msg.key.remoteJid;

        if (!isOwner) return sock.sendMessage(jid, { text: "❌ *Owner only command!*" }, { quoted: msg });
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ *Group only!*" }, { quoted: msg });

        const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
        const config = getSettings(botNumber);

        let antiStatusChats = config.antiStatusChats || [];
        let antiStatusMode = config.antiStatusMode || {};

        const action = (args[0] || "").toLowerCase();
        const mode = (args[1] || "delete").toLowerCase();

        if (action === "on") {
            if (!["warn", "delete", "kick"].includes(mode)) {
                return sock.sendMessage(jid, {
                    text: `❌ *Invalid mode!*\n\nExamples:\n.antistatus on warn\n.antistatus on delete\n.antistatus on kick`
                }, { quoted: msg });
            }

            if (!antiStatusChats.includes(jid)) {
                antiStatusChats.push(jid);
                updateSetting(botNumber, "antiStatusChats", antiStatusChats);
            }

            antiStatusMode[jid] = mode;
            updateSetting(botNumber, "antiStatusMode", antiStatusMode);

            return sock.sendMessage(jid, {
                text: `✅ *Anti-Status Mention Enabled*\nMode: ${mode.toUpperCase()}\n\n_Note: Bot must be admin for kick mode._`
            }, { quoted: msg });
        }

        if (action === "off") {
            antiStatusChats = antiStatusChats.filter(x => x !== jid);
            updateSetting(botNumber, "antiStatusChats", antiStatusChats);

            delete antiStatusMode[jid];
            updateSetting(botNumber, "antiStatusMode", antiStatusMode);

            return sock.sendMessage(jid, { text: "❌ *Anti-Status Mention Disabled*" }, { quoted: msg });
        }

        const status = antiStatusChats.includes(jid) ? `ON (${antiStatusMode[jid] || 'delete'})` : "OFF";
        return sock.sendMessage(jid, {
            text: `╭━━━〔 ANTI-STATUS 〕━━━⬣\n\nStatus: ${status}\n\n.antistatus on [warn/delete/kick]\n.antistatus off\n\n╰━━━━━━━━━━━━━━⬣`
        }, { quoted: msg });
    }
};