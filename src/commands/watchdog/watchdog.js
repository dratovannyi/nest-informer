

const {Client,SlashCommandBuilder, IntentsBitField, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents:[
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      GatewayIntentBits.Guilds
  ]
});


const map = require("../../map.js")
const solver = require('../../capsolver.js');

let lastSended = 0
async function sendAlert(interaction, mode) {
	let res = await map.getData()
	
	
	let capres = -1
	if (res){
		while (res.data.error === 2 || capres === 2){
			
				console.log(res.data.error)
				const token = await solver.passReCap()
				
				console.log('||||||||||||||||||||||',token)
				res = await map.getData(token)
				capres = res.data.error
				console.log('res2:',res.data.error)
		
		}

		console.log(res.data)
		if(res.data.length != 'undefined' || res.data.length > 0){
			const filteredResTeamOne = res.data.players.filter(function (player) {return player.team === 1})
			const filteredRes = res.data.players.filter(function (player) {
				if(player.x >= -20 && player.x <= 80 && player.z >= 80 && player.z <= 145){player.place = '[Перед кишкой](https://map.minecraft-galaxy.ru/#'+player.x+'/'+player.z+'/29/0/129/)'}
				if(player.x >= -10 && player.x <= 80 && player.z >= 146 && player.z <= 190){player.place = '[Кишка](https://map.minecraft-galaxy.ru/#'+player.x+'/'+player.z+'/29/0/129/)'}
				if(player.x >= -74 && player.x <= -9 && player.z <= 220 && player.z >= 145){player.place = '[Паркур](https://map.minecraft-galaxy.ru/#'+player.x+'/'+player.z+'/29/0/129/)'}
				if(player.x >= -119 && player.x <= -75 && player.z <= 220 && player.z >= 145){player.place = '[Арена](https://map.minecraft-galaxy.ru/#'+player.x+'/'+player.z+'/29/0/129/)'}
				if(player.x >= -180 && player.x <= -120 && player.z <= 220 && player.z >= 145){player.place = '[Голова](https://map.minecraft-galaxy.ru/#'+player.x+'/'+player.z+'/29/0/129/)'}
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
							||player.x >= -180 && player.x <= -120 && player.z <= 220 && player.z >= 145
							)
			});

			const resNicks = filteredRes.map(obj => obj.name).join("\n")
			const resPlaces = filteredRes.map(obj => obj.place).join("\n")
			const resTeam = filteredRes.map(obj => obj.team).join("\n")
			const resLinks = filteredRes.map(obj => obj.link).join("\n")

	console.log(filteredRes)
			const date = new Date
			const formattedDate = date.toLocaleString() 
			const exampleEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle(`Enemies and neutrals    [ ${filteredRes.length.toString() || '0'} ] `)
				//.setAuthor({ name: 'Dragon map link', url: 'https://map.minecraft-galaxy.ru/#-49/122/29/0/129/' })
				.setDescription(`${formattedDate} `)
				.addFields(
					{ name: ' ', value: `                                                       ` },
					{ name: 'Ник', value: `${'>>> '+resLinks || ' '}`, inline: true },
					{ name: 'Локация', value: `${'>>> '+resPlaces || ' '}`, inline: true },
					{ name: 'Союз?', value: `${'>>> '+resTeam || ' '}`, inline: true },
					{ name: ' ', value: ' ' },
				)
				//.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
					 
				
				.setFooter({ text: `Союзников на сервере: ${filteredResTeamOne.length.toString() || '0'}       `});
				console.log(Date.now() > lastSended+60000)
				if(filteredRes.length > 0 && Date.now() > lastSended+60000 && mode ==='default' ||filteredRes.length > 0 && mode !=='default') {
					interaction.channel.send({ embeds: [exampleEmbed] })
					lastSended = Date.now()
					console.log(lastSended)
					console.log(Date.now())
					console.log(mode)
					//if(mode === 'slow') await new Promise(resolve => setTimeout(resolve, 55000))
				}
				
				
  	}
	}

	
}


let intervalId;

function startLoop(interaction, mode, int ) {

    intervalId = setInterval(() => {
				sendAlert(interaction, mode)
				
    }, int );
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watchdog')
		.setDescription('Nest watchdog')
		.addSubcommand(subcommand =>
			subcommand
				.setName('start')
				.setDescription('Start watchdog'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('pause')
				.setDescription('Pause watchdog'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('modedfault')
				.setDescription('Check each 5 sec & message each minute(default)'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('modefast')
				.setDescription('Check & message each 5 secs'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('modeslow')
				.setDescription('Check & message each minute')),
	async execute(interaction) {
		const sub = interaction.options.getSubcommand()
		console.log(sub)
		if(sub === 'start'){
			await interaction.reply('Watchdog started')
			startLoop(interaction, 'default', 6000)
		}
		if(sub === 'pause'){
			await interaction.reply('Watchdog paused');
			clearInterval(intervalId);
		}
		if(sub === 'modedefault'){
			await interaction.reply('Watchdog mode set to fast');
			clearInterval(intervalId);
      startLoop(interaction, 'default', 6000)
     
		}
		if(sub === 'modefast'){
			await interaction.reply('Watchdog mode set to fast');
			clearInterval(intervalId);
			startLoop(interaction, 'fast', 6000) 
		}
		if(sub === 'modeslow'){
			await interaction.reply('Watchdog mode set to slow');
			clearInterval(intervalId);
      startLoop(interaction, 'slow', 60000)
       
  
		}
		//await interaction.reply('Pong!');
    //console.log('cmd recieved')
	},
};