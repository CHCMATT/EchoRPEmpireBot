require('discord.js');
let dbCmds = require('./dbCmds.js');

module.exports.initPersonnel = async (client, userId) => {
	let guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
	let user = await guild.members.fetch(userId);
	let initCharName;
	if (user.nickname) {
		initCharName = user.nickname;
	} else {
		initCharName = user.user.username;
	}
	await dbCmds.initPersStats(userId, initCharName);
};