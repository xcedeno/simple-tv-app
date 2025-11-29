import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.CHAT_ID;

if (!token || !chatId) {
    console.error('Error: Faltan credenciales en .env');
    process.exit(1);
}

const bot = new TelegramBot(token);

console.log('Intentando enviar mensaje de prueba...');

bot.sendMessage(chatId, '🤖 Hola! Soy tu bot de notificaciones. Si lees esto, la configuración es correcta.')
    .then(() => {
        console.log('✅ Mensaje enviado con éxito! Revisa tu Telegram.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error al enviar mensaje:', error.message);
        if (error.response && error.response.body) {
            console.error('Detalles del error:', error.response.body);
        }
        process.exit(1);
    });
