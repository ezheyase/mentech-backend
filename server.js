/* FILENAME: server.js
   COMMAND TO RUN: npm install express discord.js body-parser cors && node server.js
*/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// --- YOUR CONFIGURATION ---
const CONFIG = {
    TOKEN: "MTQ3Mzg0NDEyMDY5NDAzMDQ2Nw.G9qyo2.TzR4kI820rZAEmEbSBAbPIIf_A1LOZ06T71wp0",
    SERVER_ID: "1473810671312437342",
    SUPPORT_CHANNEL: "1473846257326751896",
    RECRUIT_CHANNEL: "1473825790725722394"
};

const app = express();
app.use(bodyParser.json());
app.use(cors());

// DISCORD BOT SETUP
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// MEMORY FOR CHAT (To store Majda's replies)
let lastSupportReply = "";

client.on('ready', () => {
    console.log(`✅ Bot Connected as ${client.user.tag}`);
    console.log(`✅ Ready to serve Mentech`);
});

// LISTEN FOR MESSAGES FROM MAJDA (IN DISCORD)
client.on('messageCreate', (message) => {
    // If message is in Support Channel AND not from the bot itself
    if (message.channel.id === CONFIG.SUPPORT_CHANNEL && !message.author.bot) {
        console.log(`Majda Replied: ${message.content}`);
        lastSupportReply = message.content;
    }
});

client.login(CONFIG.TOKEN);

// --- API ROUTES ---

// 1. SEND SUPPORT MESSAGE (Site -> Discord)
app.post('/api/support/send', async (req, res) => {
    const { user, message } = req.body;
    try {
        const channel = await client.channels.fetch(CONFIG.SUPPORT_CHANNEL);
        // Send a clean Embed
        const embed = new EmbedBuilder()
            .setColor(0x3b82f6)
            .setTitle(`💬 Support: ${user}`)
            .setDescription(message)
            .setFooter({ text: "Répondez ici, le client verra le message." });
        
        await channel.send({ embeds: [embed] });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Discord Error" });
    }
});

// 2. CHECK FOR REPLIES (Site polls this)
app.get('/api/support/poll', (req, res) => {
    res.json({ reply: lastSupportReply });
    if(lastSupportReply !== "") lastSupportReply = ""; // Clear after sending
});

// 3. RECRUITMENT APPLICATION
app.post('/api/recruit', async (req, res) => {
    const { name, phone, specialty } = req.body;
    try {
        const channel = await client.channels.fetch(CONFIG.RECRUIT_CHANNEL);
        const embed = new EmbedBuilder()
            .setColor(0x10b981) // Green
            .setTitle(`👷 Nouvelle Candidature: ${name}`)
            .addFields(
                { name: "Téléphone", value: phone, inline: true },
                { name: "Spécialité", value: specialty, inline: true },
                { name: "Statut", value: "⏳ En attente de validation", inline: false }
            );
        
        await channel.send({ embeds: [embed] });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. MISSION PAYMENT DECLARATION (The "Double Check" Logic)
app.post('/api/mission/declare', async (req, res) => {
    const { clientName, techName, clientPaid, techReceived, mission } = req.body;
    
    // Logic: Check if amounts match
    const isMatch = parseInt(clientPaid) === parseInt(techReceived);
    const color = isMatch ? 0x10b981 : 0xef4444; // Green if match, Red if fraud
    const status = isMatch ? "✅ PAIEMENT VALIDÉ" : "⚠️ CONFLIT DÉTECTÉ";

    try {
        // Send to Support Channel for Admin review (or a specific logs channel)
        const channel = await client.channels.fetch(CONFIG.SUPPORT_CHANNEL);
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`💰 Clôture Mission: ${status}`)
            .setDescription(`Mission: ${mission}`)
            .addFields(
                { name: "👤 Client", value: `${clientName} a déclaré payer: **${clientPaid} DH**`, inline: false },
                { name: "👷 Technicien", value: `${techName} a déclaré recevoir: **${techReceived} DH**`, inline: false }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        res.json({ success: true, match: isMatch });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// START SERVER
app.listen(3000, () => {
    console.log("🚀 Mentech Server running on http://localhost:3000");
});
