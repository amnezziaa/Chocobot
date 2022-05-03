const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ProfileModel = require('../models/profileSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Permet de récupérer des ChocoCoins chaque jour'),
    async execute(client, message, args, profileData) {

        profileData = await ProfileModel.findOne({ userID: message.author.id });
        if (!profileData) {
            return;
        }

        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }

        function convertMsToHM(milliseconds) {
            if (milliseconds >= 86340000) {
                return '23:59';
            }
            let seconds = Math.floor(milliseconds / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);

            seconds = seconds % 60;
            minutes = seconds >= 30 ? minutes + 1 : minutes;
            minutes = minutes % 60;
            hours = hours % 24;

            return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
        }

        let dateDifference = new Date().getTime() - profileData.dailyCheck.getTime();
        let timeDifference = dateDifference / 86400000;

        if (profileData.dailyCheck === null || timeDifference > 1) {

            const balanceUpdate = await ProfileModel.findOneAndUpdate({
                userID: message.author.id,
            },
                {
                    $inc: {
                        chococoins: 2000,
                    }
                });

            const dateUpdate = await ProfileModel.findOneAndUpdate({
                userID: message.author.id,
            },
                {
                    $set: {
                        dailyCheck: new Date(),
                    }
                });

            const dailySuccessfullEmbed = new MessageEmbed()
                .setColor('#F8F70E')
                .setThumbnail(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.jpeg`)
                .setTitle(`Votre compte à bien été crédité de 2000 ChocoCoins`)
                .setFields(
                    { name: `Nouveau montant de ChocoCoins : `, value: `${profileData.chococoins + 2000} ©` },
                )
            message.channel.send({ embeds: [dailySuccessfullEmbed] });
        } else {
            const dailyFailedEmbed = new MessageEmbed()
                .setColor('#F8F70E')
                .setThumbnail(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.jpeg`)
                .setTitle(`Votre daily n'est pas disponible ${message.author.username}`)
                .setFields(
                    { name: `Vous pourrez utiliser votre daily dans :`, value: `${convertMsToHM(86400000 - dateDifference)}h` },
                )
            message.channel.send({ embeds: [dailyFailedEmbed] });
        }
    },
};