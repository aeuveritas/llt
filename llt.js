const {token, chatId, batteryConfig} = require('./config.json');

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
            let interval = batteryConfig.normal.interval;
            level *= 100;

            if (is_charging) {
                if (level > batteryConfig.charge_hard.level) {
                    interval = batteryConfig.charge_hard.interval;
                    message = '[ERROR] more than 80% (' + level + '%)';
                } else if (level > batteryConfig.charge_soft.level) {
                    interval = batteryConfig.charge_soft.interval;
                    message = '[WARNING]  more than 75% (' + level + '%)';
                }
            } else {
                if (level < batteryConfig.drain_hard.level) {
                    interval = batteryConfig.drain_hard.interval;
                    message = '[ERROR] less than 30%: (' + level + '%)';
                } else if (level < batteryConfig.drain_soft.level) {
                    interval = batteryConfig.drain_soft.interval;
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
