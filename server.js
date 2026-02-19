const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ==================== CONFIGURATION ====================
const SUPPORT_WEBHOOK = 'https://discord.com/api/webhooks/1473811156626837617/N1_ynWzRTcgErVHaV2OiOq8bWmAnLtU8FDOqAYOia621T6u-XhIrfBJgHE6t4EPzbDhC';
const RECRUITMENT_WEBHOOK = 'https://discord.com/api/webhooks/1473825828700946555/TU29M7GsUXb24Hn8nphfviURKa3uHdt6KA5JyVWvzkLvj83Moy7UdZWR0-GXE1O-fIYj';

// ==================== TEST ENDPOINT ====================
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'MENTECH BACKEND 2026',
    time: new Date().toISOString()
  });
});

// ==================== SUPPORT ENDPOINT ====================
app.post('/api/support', async (req, res) => {
  try {
    const { name, phone, message, sessionId } = req.body;
    
    const discordMsg = {
      content: `📞 **NOUVEAU SUPPORT - ${new Date().toLocaleString('fr-FR')}**`,
      embeds: [{
        title: `👤 Client: ${name}`,
        color: 0x25D366,
        fields: [
          { name: '📱 Téléphone', value: phone, inline: true },
          { name: '💬 Message', value: message, inline: false },
          { name: '🆔 Session', value: `\`${sessionId}\``, inline: false }
        ],
        footer: { text: 'Support Majda • En attente de réponse' }
      }]
    };
    
    await fetch(SUPPORT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMsg)
    });
    
    res.json({ success: true, sessionId });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RECRUITMENT ENDPOINT ====================
app.post('/api/recruit', async (req, res) => {
  try {
    const { name, phone, email, city, specialty } = req.body;
    
    const discordMsg = {
      content: `📄 **NOUVELLE CANDIDATURE - ${new Date().toLocaleString('fr-FR')}**`,
      embeds: [{
        title: `👤 ${name}`,
        color: 0x5865F2,
        fields: [
          { name: '📱 Téléphone', value: phone, inline: true },
          { name: '📧 Email', value: email, inline: true },
          { name: '📍 Ville', value: city, inline: true },
          { name: '🔧 Spécialité', value: specialty, inline: true }
        ],
        footer: { text: 'Recrutement • Nouvelle candidature' }
      }]
    };
    
    await fetch(RECRUITMENT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMsg)
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MISSION ENDPOINT ====================
app.post('/api/mission', async (req, res) => {
  try {
    const { clientName, clientPhone, techName, service, problem, city, missionId } = req.body;
    
    const discordMsg = {
      content: `🔧 **NOUVELLE MISSION - ${missionId}**`,
      embeds: [{
        title: `👤 Client: ${clientName}`,
        color: 0xE11D48,
        fields: [
          { name: '📱 Téléphone', value: clientPhone, inline: true },
          { name: '🔧 Technicien', value: techName, inline: true },
          { name: '🛠️ Service', value: service, inline: true },
          { name: '🔍 Problème', value: problem, inline: false },
          { name: '📍 Ville', value: city, inline: true }
        ],
        footer: { text: 'Le technicien a 30 secondes pour répondre' }
      }]
    };
    
    await fetch(SUPPORT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMsg)
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TECH RESPONSE ENDPOINT ====================
app.post('/api/tech-response', async (req, res) => {
  try {
    const { missionId, techName, response, price } = req.body;
    
    const color = response === 'accepted' ? 0x10B981 : 0xEF4444;
    const status = response === 'accepted' ? '✅ ACCEPTÉE' : '❌ REFUSÉE';
    
    const fields = [
      { name: '🔧 Technicien', value: techName, inline: true },
      { name: '🆔 Mission', value: missionId, inline: true }
    ];
    
    if (price) {
      fields.push({ name: '💰 Prix final', value: `${price} MAD`, inline: true });
    }
    
    const discordMsg = {
      content: `**${status}**`,
      embeds: [{
        color: color,
        fields: fields,
        timestamp: new Date().toISOString()
      }]
    };
    
    await fetch(SUPPORT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMsg)
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MENTECH BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`📡 Webhook Support: ${SUPPORT_WEBHOOK.substring(0, 50)}...`);
});
