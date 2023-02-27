const Eris = require("eris")
const api = require("axios")
var mysql = require('mysql');

require('dotenv').config()
//var cron = require('node-cron')
const Constants = Eris.Constants
var wasLastMsgAddEvent = false;
var referenceId = "";

var con = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DB_NAME
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

// Replace TOKEN with your bot account's token
const bot = new Eris(process.env.BOT_KEY, {
    intents: [
        "guildMessages"
    ]
});

bot.on("ready", () => { // When the bot is ready
    bot.createMessage("1076576128837365850", "John's Fun Bot is up and running!");
    console.log("Ready!"); // Log "Ready!"
});

bot.on("error", (err) => {
    console.error(err); // or your preferred logger
});

bot.on("messageCreate", (msg) => { // When a message is created
    var authorTheBot = isTheAuthorTheBot(msg.author.username);
    var discChannelId = msg.channel.id;
    var discName = msg.author.username;
    if (!authorTheBot) { //This is necessary because the bot was responding to its own messages causing an infinite loop
        if (wasLastMsgAddEvent) {
            var todaysDate = new Date().toISOString().split('T')[0];
            var sql = "INSERT INTO events (event_content, event_date) VALUES ('" + msg.content + "','" + todaysDate + "')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                bot.createMessage(discChannelId, "Your record has been recorded. Please type 'get events' in order to retrieve your stored events.");
                wasLastMsgAddEvent = false;
            });
        } else {
            switch (msg.content.toUpperCase()) {
                case "HI":
                case "HELLO":
                case "YO":
                case "HOWDY": bot.createMessage(discChannelId, "Hey there: " + discName + "!");
                    break;
                case "GET THE NEWS TITLES": bot.createMessage(discChannelId, retrieveNewsTitlesNexus().toString());
                    break;
                case "HEY BOT SUCK MY ASS": bot.createMessage(discChannelId, "No " + discName + " you suck my ass");
                    break;
                case "HOW MANY TIMES DOES EGAN DAB EACH DAY?": bot.createMessage(discChannelId, "UNEXPECTED DATA TYPE FAULT: Maximum value for a variable of type int = 2147483647");
                    break;
                case "!SELECT": bot.createMessage(discChannelId, createDiscordButtonHelper());
                    break;
                case "ADD EVENT": 
                    bot.createMessage(discChannelId, "What content would you like to store?");
                    wasLastMsgAddEvent = true;
                    break;
                case "GET EVENTS":
                    con.query("SELECT * FROM events", function (err, result, fields) {
                        if (err) throw err;
                        console.log(result);
                        var presentedData = [];
                        result.forEach(function(item) {
                            presentedData.push("" + item.event_content + " ");
                        })
                        bot.createMessage(discChannelId, {embed: buildEmbeddedList(presentedData)});
                    });
                    break;
                default: bot.createMessage(discChannelId, "Hi " + discName + " I don't have any logic mapped for that command please try again. Also u suck lol");
            }
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

const buildEmbeddedList = (presentedData) => {
    return {
        title: "List Of Recorded Events",
        description: presentedData.toString(),
        url: "https://blob-project.com",
        timestamp: new Date(),
        color: 0x7289DA,
        footer: {
            text:"That was the event list that is stored in the database."
        },
        image: {
            url:"https://i.ibb.co/BrkS6BX/unboost.png"
        },
        thumbnail: {
            url: "https://i.ibb.co/BrkS6BX/unboost.png"
        },
        fields: [
            {name: "This is a field", value: "This is a field (value", inline:true}
        ],
        author: {
            name: "This is an author", url: "https://blob-project.com"
        }
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