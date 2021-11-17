require("dotenv").config();
const fs = require("fs");
const {REST} = require("@discordjs/rest");
const {Routes} =  require("discord-api-types/v9");
const { Client, Intents, Collection, Interaction } = require('discord.js');
const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

const commandFiles = fs.readdirSync("./Commands").filter(file => file.endsWith(".js"));

const commands = [];

client.commands = new Collection();

for (const file of commandFiles){
  const command = require(`./Commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log("Bot Is Online");

  const CLIENT_ID = client.user.id;

  const rest = new REST({
    version: "9"
  }).setToken(process.env.TOKEN);

  (async () => {
    try {
      if(process.env.ENV === "production"){
        await rest.put(Routes.applicationCommands(CLIENT_ID),{
          body: command
        });
        console.log("Success Global");
      } else{
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILDS_ID),{
          body: commands  
        });
        console.log("Success Local");
      }
    }
    catch (err){
      if(err) console.error(err);
    }
  })();
});

client.on("interactionCreate", async Interaction => {
  if(!Interaction.isCommand()) return;

  const command = client.commands.get(Interaction.commandName);

  if(!command) return;

  try {
    await command.execute(Interaction);
  } catch(err) {
    if(err) console.error(err);

    await Interaction.reply({content: "An Error"
    });
  }
})

client.login(process.env.TOKEN);