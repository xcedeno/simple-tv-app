// server.js
import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';

const app = express();
const PORT = 3001;

// Reemplaza con tu token de bot y tu chat_id desde .env
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TELEGRAM_TOKEN || !CHAT_ID) {
  console.error('Error: TELEGRAM_TOKEN o CHAT_ID no están definidos en el archivo .env');
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN); // Polling no es necesario para enviar mensajes, pero si quieres recibir, añade { polling: true }

app.get('/enviar-recordatorio', async (req, res) => {
  try {
    // 1. Obtener las cuentas desde Supabase (ajusta la URL y API KEY)
    const response = await fetch('https://prxzjevldfpjwscwuarx.supabase.co/rest/v1/accounts', {
      headers: {
        'apikey': 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeHpqZXZsZGZwandzY3d1YXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTkwOTcsImV4cCI6MjA2MTE5NTA5N30',
        'Authorization': 'Bearer eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeHpqZXZsZGZwandzY3d1YXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTkwOTcsImV4cCI6MjA2MTE5NTA5N30'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching accounts: ${response.statusText}`);
    }

    const accounts = await response.json();

    // 2. Calcular días restantes y armar el mensaje
    let mensaje = '⏰ Recordatorio de cuentas próximas a corte:\n\n';
    const hoy = new Date();
    let cuentasEncontradas = 0;

    accounts.forEach(account => {
      if (account.devices && Array.isArray(account.devices)) {
        account.devices.forEach(device => {
          const cutoff = new Date(device.cutoff_date);
          const diff = Math.ceil((cutoff - hoy) / (1000 * 60 * 60 * 24));
          mensaje += `• ${account.alias} (${device.room_number}): ${diff} días restantes (Corte: ${device.cutoff_date})\n`;
          cuentasEncontradas++;
        });
      }
    });

    if (cuentasEncontradas === 0) {
      mensaje += 'No hay cuentas próximas a corte o no se encontraron dispositivos.';
    }

    // 3. Enviar mensaje por Telegram
    await bot.sendMessage(CHAT_ID, mensaje);

    res.send('Mensaje enviado correctamente');
  } catch (error) {
    console.error('Error al enviar recordatorio:', error);
    res.status(500).send(`Error al enviar recordatorio: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});