const Eris = require("eris")
const api = require("axios")
require('dotenv').config()
//var cron = require('node-cron')
const Constants = Eris.Constants

// Replace TOKEN with your bot account's token
const bot = new Eris(process.env.BOT_KEY, {
    intents: [
        "guildMessages"
    ]
});

bot.on("ready", () => { // When the bot is ready
    bot.createMessage("1076576128837365850","John's Fun Bot is up and running!");
    console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
    console.error(err); // or your preferred logger
});

/**
 * cron.schedule('* * * * *', () => {
    console.log("Scheduled Message Begins");
    bot.createMessage("1076576128837365850", "This is a scheduled message executing every minute. Current Time is " + new Date());
});
 */

bot.on("messageCreate", (msg) => { // When a message is created
    var authorTheBot = isTheAuthorTheBot(msg.author.username);
    var discChannelId = msg.channel.id;
    var discName = msg.author.username;
    if (!authorTheBot) { //This is necessary because the bot was responding to its own messages causing an infinite loop
        switch (msg.content) {
            case "get the news titles":  bot.createMessage(discChannelId, retrieveNewsTitlesNexus().toString());
                break;
            case "hey bot suck my ass": bot.createMessage(discChannelId, "No " + discName + " you suck my ass");
                break;
            case "how many times does egan dab each day?": bot.createMessage(discChannelId, "UNEXPECTED DATA TYPE FAULT: Maximum value for a variable of type int = 2147483647");
                break;
            case "!select": bot.createMessage(discChannelId, createDiscordButtonHelper());
                break;
            default: bot.createMessage(discChannelId, "Hi " + discName + " I don't have any logic mapped for that command please try again. Also u suck lol");
        }
    }
});

const createDiscordButtonHelper = () => {
    return {
        content: "Button Example",
        components: [
            {
                type: Constants.ComponentTypes.ACTION_ROW, // You can have up to 5 action rows, and 1 select menu per action row
                components: [
                    {
                        type: Constants.ComponentTypes.BUTTON, // https://discord.com/developers/docs/interactions/message-components#buttons
                        style: Constants.ButtonStyles.PRIMARY, // This is the style of the button https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
                        custom_id: "click_one",
                        label: "Click me!",
                        disabled: false // Whether or not the button is disabled, is false by default
                    }
                ]
            }
        ]
    };
}

const retrieveNewsTitlesNexus = async () => {
    var presentedData = [];
    nexusData = await api.get(
        `https://api.nexushub.co/wow-classic/v1/news`
    );
    nexusData.data.forEach(function (article) {
        presentedData.push(article.title)
    })
    return presentedData;
}

const isTheAuthorTheBot = (username) => {
    return username === "John's Fun Bot";
}

bot.connect(); // Get the bot to connect to Discord