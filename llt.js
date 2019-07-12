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
    (async () => {
        try {
            let cnt = 0;
            let state;
            let level;
            let message;
            let interval = batteryConfig.normal.interval;

            for await (promise of [isCharging(), batteryLevel()]) {
                switch (cnt) {
                case 0:
                    state = promise;
                    break;
                case 1:
                    level = promise;
                    break;
                default:
                    console.error('wrong cnt');
                }
                cnt++;
            }

            if (state) {
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
            console.log("charging: " + state + ", level: " + level + ", interval: " + interval);

            bot.sendMessage(chatId, message);

            setTimeout(checkBattery, interval);
        } catch (error) {
            console.error(error);
        }
    })();
};

if (chatId) {
    setTimeout(() => {
        console.log('start');

        setTimeout(checkBattery, 1000);
    }, 1000);
}
