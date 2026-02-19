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
const supportSessions = {};
const missionResponses = {};

// ==================== ENDPOINTS ====================

app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'MENTECH BACKEND' });
});

// Support - Client envoie message
app.post('/api/support', async (req, res) => {
  try {
    const { name, phone, message, sessionId } = req.body;
    
    if (!supportSessions[sessionId]) {
      supportSessions[sessionId] = { messages: [] };
    }
    
    supportSessions[sessionId].messages.push({
      id: Date.now(),
      from: 'client',
      text: message,
      time: new Date().toISOString()
    });
    
    await fetch(SUPPORT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📞 **SUPPORT - Session ${sessionId}**\n👤 **Client:** ${name}\n📱 **Tél:** ${phone}\n💬 **Message:** ${message}`
      })
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Support - Client vérifie les réponses
app.get('/api/support/messages/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const since = req.query.since ? parseInt(req.query.since) : 0;
  
  const session = supportSessions[sessionId];
  if (!session) return res.json({ messages: [] });
  
  const newMessages = session.messages.filter(m => m.id > since);
  res.json({ messages: newMessages });
});

// Mission - Client crée mission
app.post('/api/mission', async (req, res) => {
  try {
    const mission = req.body;
    
    missionResponses[mission.id] = { status: 'pending' };
    
    await fetch(CONFIRMATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🔧 **NOUVELLE MISSION - ${mission.id}**\n👤 **Client:** ${mission.clientName}\n📞 **Tél:** ${mission.clientPhone}\n🔧 **Technicien:** ${mission.techName}\n🛠️ **Service:** ${mission.service}\n🔍 **Problème:** ${mission.problem}\n📍 **Ville:** ${mission.city}`
      })
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mission - Tech répond
app.post('/api/tech-response', async (req, res) => {
  try {
    const { missionId, techName, response, price } = req.body;
    
    missionResponses[missionId] = { status: response, price };
    
    const status = response === 'confirmed' ? '✅ CONFIRMÉE' : '❌ REFUSÉE';
    await fetch(CONFIRMATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `${status}\n🆔 **Mission:** ${missionId}\n🔧 **Technicien:** ${techName}${price ? `\n💰 **Prix:** ${price} MAD` : ''}`
      })
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mission - Client check status
app.get('/api/mission/status/:missionId', (req, res) => {
  const { missionId } = req.params;
  res.json(missionResponses[missionId] || { status: 'pending' });
});

// Recrutement
app.post('/api/recruit', async (req, res) => {
  try {
    const { name, phone, email, city, specialty } = req.body;
    
    await fetch(RECRUITMENT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📄 **NOUVELLE CANDIDATURE**\n👤 **Nom:** ${name}\n📱 **Tél:** ${phone}\n📧 **Email:** ${email}\n📍 **Ville:** ${city}\n🔧 **Spécialité:** ${specialty}`
      })
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MENTECH BACKEND RUNNING ON PORT ${PORT}`);
});
