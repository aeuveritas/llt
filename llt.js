const {token, chatId} = require('./config.json');

const batteryLevel = require('battery-level');
const isCharging = require('is-charging');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/chatid/, (msg) => {
    console.log('chatId: ' + msg.chat.id);
    process.exit(0);
});

let checkBattery = () => {
    isCharging().then(is_charging => {
        batteryLevel().then(level => {
            let message;
            let interval = 600000;
            level *= 100;
            if (is_charging) {
                if (level > 80) {
                    interval = 60000;
                    message = '[ERROR] more than 80% (' + level + '%)';
                } else if (level > 75) {
                    interval = 180000;
                    message = '[WARNING]  more than 75% (' + level + '%)';
                }
            } else {
                if (level < 30) {
                    interval = 60000;
                    message = '[ERROR] less than 30%: (' + level + '%)';
                } else if (level < 35) {
                    interval = 180000;
                    message = '[WARNING] less than 35% (' + level + '%)';
                }
                message = '[INFO] current level: ' + level + '%';
            }
            console.log("charging: " + is_charging + ", level: " + level + ", interval: " + interval);

            bot.sendMessage(chatId, message);

            setTimeout(checkBattery, interval);
        }).catch((err) => {
            console.error(err);
        });
    }).catch((err) => {
        console.error(err);
    });
};

if (chatId) {
    setTimeout(() => {
        console.log('start');
        bot.sendMessage(chatId, "BOOT ON: draccoon");

        setTimeout(checkBattery, 1000);
    }, 1000);
}
