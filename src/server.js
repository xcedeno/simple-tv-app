// server.js
const express = require('express');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = 3001;

// Reemplaza con tu token de bot y tu chat_id
const TELEGRAM_TOKEN = 'TU_TELEGRAM_BOT_TOKEN';
const CHAT_ID = 'TU_CHAT_ID';

const bot = new TelegramBot(TELEGRAM_TOKEN);

app.get('/enviar-recordatorio', async (req, res) => {
  // 1. Obtener las cuentas desde Supabase (ajusta la URL y API KEY)
  const response = await fetch('https://prxzjevldfpjwscwuarx.supabase.co/rest/v1/accounts', {
    headers: {
      'apikey': 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeHpqZXZsZGZwandzY3d1YXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTkwOTcsImV4cCI6MjA2MTE5NTA5N30',
      'Authorization': 'Bearer eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeHpqZXZsZGZwandzY3d1YXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTkwOTcsImV4cCI6MjA2MTE5NTA5N30'
    }
  });
  const accounts = await response.json();

  // 2. Calcular días restantes y armar el mensaje
  let mensaje = '⏰ Recordatorio de cuentas próximas a corte:\n\n';
  const hoy = new Date();

  accounts.forEach(account => {
    account.devices.forEach(device => {
      const cutoff = new Date(device.cutoff_date);
      const diff = Math.ceil((cutoff - hoy) / (1000 * 60 * 60 * 24));
      mensaje += `• ${account.alias} (${device.room_number}): ${diff} días restantes (Corte: ${device.cutoff_date})\n`;
    });
  });

  // 3. Enviar mensaje por Telegram
  await bot.sendMessage(CHAT_ID, mensaje);

  res.send('Mensaje enviado');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});