/* IMPORTS */
const NS = require("netschoolapi").default;
const moment = require("moment");
const VkBot = require("node-vk-bot-api");
const Markup = require("node-vk-bot-api/lib/markup");
const config = require("./config.json");

/* INITIALIZATION */
const user = new NS({
    login: config.netschool.login,
    password: config.netschool.password,
    school: config.netschool.school,
    origin: config.netschool.api
});

const bot = new VkBot(config.vk.token); 

bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (e) { console.error(e); }
});

bot.command(config.vk.prefix + "расписание", async (ctx) => {
    await ctx.reply(await formatSchedule(await getSchedule()));
});

bot.command(config.vk.prefix + "+клавиатура", async (ctx) => { 
    ctx.reply("✅ Клавиатура включена.", null,
        Markup.keyboard([
            Markup.button("Расписание", "positive", {
                command: "@s5cls расписание"
            })
        ]));
});

bot.command(config.vk.prefix + "-клавиатура", async (ctx) => { 
    ctx.reply("✅ Клавиатура отключена.", null,
        Markup.keyboard([]).oneTime());
});

bot.startPolling();

/* FUNCTIONS */
async function formatDate(date) {
    // russian format
    return moment(date).format("DD.MM.YYYY");
}

async function formatTime(date) {
    // also russian format
    return moment(date).format("HH:mm");
}

async function getPluralForm(count) {
    // works only with word "урок" and "count" up to 20
    if (count > 20 || count < 0) return "";

    if (count === 0 || count > 4) return "уроков"
    else if (count === 1) return "урок"
    else return "урока";
}


async function getSchedule(start, end) {
    if (!(start && end)) {
        // we are getting yesterday,
        start = new Date(new Date().getTime() - 86400000);
        // and adding 2 days to it, so we get tomorrow
        end = new Date(start.getTime() + 86400000 * 2);
        // 86400000 is 1 day in milliseconds
    }

    const diary = await user.diary(); // can"t access object properties while using await :/
    return diary.slice({ start: start, end: end });
}

async function formatSchedule(schedule) {
    var formatted = "";

    for (var i = 0; i < schedule.length; i++) {
        const day = schedule[i];
        const lessonCount = day.lessons.length;

        formatted += `${await formatDate(day.date)}, ${lessonCount} ${await getPluralForm(lessonCount)}\n`;

        for (var j = 0; j < lessonCount; j++) {
            const lesson = day.lessons[j];
            var subject = lesson.subject;

            for (var replace of Object.keys(config.output.replace)) {
                if (subject === replace)
                    subject = config.output.replace[replace];
            }

            formatted += `${j + 1} | ${await formatTime(lesson.start)}-${await formatTime(lesson.end)} | ${subject}\n`;
        }

        formatted += "\n";
    }

    return formatted;
}

/* MAIN FUNCTION */
(async function() {
    // const formatted = await formatSchedule(await getSchedule());
    // console.log(formatted);
})();
