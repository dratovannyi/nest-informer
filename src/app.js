require('dotenv').config()
const winston = require('../src/logger');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config.json');
const  map = require("./map.js")

const {Client, Events, Collection, IntentsBitField, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents:[
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      GatewayIntentBits.Guilds
  ]
});

async function main() {
  try {
   
    
    await map.login()
    client.login(process.env.TOKEN);
    console.log('login passed')
    client.on("ready", (c) => {  //Сообщение, когда бот в сети 
      winston.info('Going online ',{event: 'BOT EVENT', code: 200, initiator: c.user.tag})

      
    
    });

    /*while(config.watch === true){
      const res = await map.getData()
      //console.log(res)
      if (res && res.data.length != 0){
        const filteredResTeamOne = res.data.players.filter(function (player) {return player.team === 1})
        const filteredRes = res.data.players.filter(function (player) {
          if(player.x >= -20 && player.x <= 80 && player.z >= 80 && player.z <= 145){player.place = 'Перед кишкой'}
          if(player.x >= -10 && player.x <= 80 && player.z >= 146 && player.z <= 190){player.place = 'Кишка'}
          if(player.x >= -74 && player.x <= -9 && player.z <= 220 && player.z >= 145){player.place = 'Паркур'}
          if(player.x >= -180 && player.x <= -75 && player.z <= 220 && player.z >= 145){player.place = 'Верх'}

          if(player.team === 0){player.team = '❓'} 
          if(player.team === 2){player.team = '⚔️'}
          if(player.name === 'DeathGun'){player.team = '💩'}
          player.link = '['+player.name+'](https://forum.minecraft-galaxy.ru/profilemain/'+player.id+')'
          return player.team != 1
                //&&el.x > -172 && el.x < 60 && el.z > 20 && el.z< 230
                &&(player.x >= -20 && player.x <= 80 && player.z >= 80 && player.z <= 145 //подход к кишке
                ||player.x >= -10 && player.x <= 80 && player.z >= 146 && player.z <= 190 //kishka
                ||player.x >= -74 && player.x <= -9 && player.z <= 220 && player.z >= 145 //rbirf
                ||player.x >= -180 && player.x <= -75 && player.z <= 220 && player.z >= 145
                )
        });

      const resNicks = filteredRes.map(obj => obj.name).join("\n")
      const resPlaces = filteredRes.map(obj => obj.place).join("\n")
      const resTeam = filteredRes.map(obj => obj.team).join("\n")
      const resLinks = filteredRes.map(obj => obj.link).join("\n")

      console.log(filteredRes)
      
      client.guilds.cache.forEach(guild => {
      // Iterate over each text channel in the guildE
        guild.channels.cache.forEach(channel => {
          //console.log(channel.type)
            // Check if the channel is a text channel
          if (channel.name === 'nest-informer' && filteredRes.length > 0) {
               // Send a message to the channel

            const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Enemies an neutrals    [ ${filteredRes.length.toString() || '0'} ]`)
            .setAuthor({ name: 'Dragon map link', url: 'https://map.minecraft-galaxy.ru/#-49/122/29/0/129/' })
            .addFields(
              { name: ' ', value: `                                                       ` },
              { name: 'Ник', value: `${'>>> '+resLinks || ' '}`, inline: true },
              { name: 'Локация', value: `${'>>> '+resPlaces || ' '}`, inline: true },
              { name: 'Союз?', value: `${'>>> '+resTeam || ' '}`, inline: true },
              { name: ' ', value: ' ' },
            )
            //.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
               
            .setTimestamp()
            .setFooter({ text: `Союзников на сервере: ${filteredResTeamOne.length.toString() || '0'}       `});
             
             channel.send({ embeds: [exampleEmbed] });
               
              
               
          }
        });
      
      });
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }*/
    
  
  } catch (error) {
    console.log(error)
    console.log('unexpected error in main()')
  }
}
main()




client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}







client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
