const Lottery = require('./lottery_schedule');


module.exports = {
    lottert_service: () => {
        const pypk10 = new Lottery({
            maxNum: 10,
            minNum: 1,
            n: 10
        }, {
                type: 101
            }, {
                startHour: 9,
                startMinute: 7,
                endHour: 23,
                endMinute: 57
            }); //建立
        pypk10.rule.minute = [2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57];
        pypk10.scheduleCronstyle();
    }
}
