const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Discord Webhooks dyalek
const SUPPORT_WEBHOOK = 'https://discord.com/api/webhooks/1473811156626837617/N1_ynWzRTcgErVHaV2OiOq8bWmAnLtU8FDOqAYOia621T6u-XhIrfBJgHE6t4EPzbDhC';
const RECRUITMENT_WEBHOOK = 'https://discord.com/api/webhooks/1473825828700946555/TU29M7GsUXb24Hn8nphfviURKa3uHdt6KA5JyVWvzkLvj83Moy7UdZWR0-GXE1O-fIYj';

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Mentech Backend is running! 🌟' });
});

// Support endpoint
app.post('/api/support', async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    
    const discordMsg = {
      content: `📞 **NOUVEAU SUPPORT**\n👤 **Client:** ${name}\n📱 **Tél:** ${phone}\n💬 **Message:** ${message}`
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

// Recruitment endpoint
app.post('/api/recruit', async (req, res) => {
  try {
    const { name, phone, city, specialty } = req.body;
    
    const discordMsg = {
      content: `📄 **NOUVEAU RECRUTEMENT**\n👤 **Nom:** ${name}\n📱 **Tél:** ${phone}\n📍 **Ville:** ${city}\n🔧 **Spécialité:** ${specialty}`
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});