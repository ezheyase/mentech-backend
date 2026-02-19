const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ==================== CONFIGURATION ====================
const SUPPORT_WEBHOOK = 'https://discord.com/api/webhooks/1473875137165135924/jkbRfQ1NtKICiKfVLJ5mb7aCcEyoyXECjv35lL5FgvP6v8hv3Pq7nnZr3SZt8hpetv6O';
const CONFIRMATION_WEBHOOK = 'https://discord.com/api/webhooks/1473811156626837617/N1_ynWzRTcgErVHaV2OiOq8bWmAnLtU8FDOqAYOia621T6u-XhIrfBJgHE6t4EPzbDhC';
const RECRUITMENT_WEBHOOK = 'https://discord.com/api/webhooks/1473825828700946555/TU29M7GsUXb24Hn8nphfviURKa3uHdt6KA5JyVWvzkLvj83Moy7UdZWR0-GXE1O-fIYj';

// ==================== STOCKAGE TEMPORAIRE ====================
// Fi blasa d database, kandiro storage f memory (ytms7 ila restart l'server)
const supportSessions = {};
const missionResponses = {};

// ==================== TEST ENDPOINT ====================
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'MENTECH BACKEND 2026',
    time: new Date().toISOString()
  });
});

// ==================== SUPPORT ENDPOINTS ====================

// Client yb3t support message
app.post('/api/support', async (req, res) => {
  try {
    const { name, phone, message, sessionId } = req.body;
    
    // Create or update session
    if (!supportSessions[sessionId]) {
      supportSessions[sessionId] = {
        messages: [],
        lastChecked: Date.now()
      };
    }
    
    // Add client message to session
    const clientMessage = {
      id: Date.now(),
      from: 'client',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    supportSessions[sessionId].messages.push(clientMessage);
    
    // Send to Discord
    const discordMsg = {
      content: `📞 **NOUVEAU MESSAGE SUPPORT**`,
      embeds: [{
        title: `👤 Client: ${name}`,
        color: 0x25D366,
        fields: [
          { name: '📱 Téléphone', value: phone, inline: true },
          { name: '💬 Message', value: message, inline: false },
          { name: '🆔 Session', value: `\`${sessionId}\``, inline: false }
        ],
        footer: { text: 'Réponds à ce message pour que le client le voie en direct' }
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

// Client ytsift lih support reply (mn Discord l site)
app.post('/api/support/reply', async (req, res) => {
  try {
    const { sessionId, message, from } = req.body;
    
    if (!supportSessions[sessionId]) {
      supportSessions[sessionId] = { messages: [] };
    }
    
    const replyMsg = {
      id: Date.now(),
      from: from || 'support',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    supportSessions[sessionId].messages.push(replyMsg);
    
    res.json({ success: true, id: replyMsg.id });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Client ycheckiw jdida
app.get('/api/support/messages/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const since = req.query.since ? parseInt(req.query.since) : 0;
  
  const session = supportSessions[sessionId];
  if (!session) {
    return res.json({ messages: [] });
  }
  
  const newMessages = session.messages.filter(m => m.id > since);
  
  res.json({
    messages: newMessages,
    lastId: session.messages.length > 0 ? session.messages[session.messages.length - 1].id : 0
  });
});

// ==================== MISSION ENDPOINTS ====================

// Client ycréi mission
app.post('/api/mission', async (req, res) => {
  try {
    const mission = req.body;
    
    // Store mission response placeholder
    missionResponses[mission.id] = {
      status: 'pending',
      response: null,
      createdAt: Date.now()
    };
    
    // Send to Discord confirmation channel
    const discordMsg = {
      content: `🔧 **NOUVELLE MISSION - ${mission.id}**`,
      embeds: [{
        title: `👤 Client: ${mission.clientName}`,
        color: 0xE31C23,
        fields: [
          { name: '📞 Téléphone', value: mission.clientPhone, inline: true },
          { name: '🔧 Technicien', value: mission.techName, inline: true },
          { name: '🛠️ Service', value: mission.service, inline: true },
          { name: '🔍 Problème', value: mission.problem, inline: false },
          { name: '📍 Ville', value: mission.city, inline: true }
        ],
        footer: { text: 'Le technicien a 30 secondes pour répondre' }
      }]
    };
    
    await fetch(CONFIRMATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMsg)
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tech yjawb 3la mission
app.post('/api/tech-response', async (req, res) => {
  try {
    const { missionId, techName, response, price } = req.body;
    
    missionResponses[missionId] = {
      status: response,
      response: response,
      price: price,
      respondedAt: Date.now()
    };
    
    const color = response === 'confirmed' ? 0x10B981 : 0xEF4444;
    const status = response === 'confirmed' ? '✅ CONFIRMÉE' : '❌ REFUSÉE';
    
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
    
    await fetch(CONFIRMATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMsg)
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Client ychecki status d mission
app.get('/api/mission/status/:missionId', (req, res) => {
  const { missionId } = req.params;
  
  const response = missionResponses[missionId] || { status: 'pending' };
  
  res.json(response);
});

// ==================== RECRUITMENT ENDPOINT ====================
app.post('/api/recruit', async (req, res) => {
  try {
    const { name, phone, email, city, specialty } = req.body;
    
    const discordMsg = {
      content: `📄 **NOUVELLE CANDIDATURE**`,
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

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MENTECH BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`📡 Webhook Support: ${SUPPORT_WEBHOOK.substring(0, 50)}...`);
  console.log(`📡 Webhook Confirmations: ${CONFIRMATION_WEBHOOK.substring(0, 50)}...`);
});
