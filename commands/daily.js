const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const ProfileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Permet de récupérer des ChocoCoins chaque jour.")
    .setDMPermission(false),
  aliases: ["d"],
  async execute({
    client: client,
    unifiedInteraction: unifiedInteraction,
    profileData: profileData,
  }) {
    const avatarUrl = `${unifiedInteraction.user.id}/${unifiedInteraction.user.avatar}`;

    // checks if message author has a coins profile

    profileData = await ProfileModel.findOne({
      userID: unifiedInteraction.user.id,
    });
    if (!profileData) {
      return;
    }

    // checks if message author's daily is available

    const differenceInDays =
      (new Date().getTime() - profileData.dailyCheck.getTime()) / 86400000;

    if (!(profileData.dailyCheck === null || differenceInDays > 1)) {
      var timeLeft = new Date(profileData.dailyCheck);
      timeLeft.setDate(timeLeft.getDate() + 1);

      const dailyFailedEmbed = new MessageEmbed()
        .setColor("#F8F70E")
        .setThumbnail(`https://cdn.discordapp.com/avatars/${avatarUrl}.jpeg`)
        .setTitle(
          `Votre daily n'est pas disponible ${unifiedInteraction.user.username}`
        )
        .setFields({
          name: `Vous pourrez utiliser votre daily :`,
          value: `<t:${Math.round(timeLeft.getTime() / 1000)}:R>`,
        });
      return unifiedInteraction.message.reply({ embeds: [dailyFailedEmbed] });
    }

    // If daily available, you get your money

    const balanceUpdate = await ProfileModel.findOneAndUpdate(
      {
        userID: unifiedInteraction.user.id,
      },
      {
        $inc: {
          chococoins: 2000,
        },
      }
    );

    const dateUpdate = await ProfileModel.findOneAndUpdate(
      {
        userID: unifiedInteraction.user.id,
      },
      {
        $set: {
          dailyCheck: new Date(),
        },
      }
    );

    const dailySuccessfullEmbed = new MessageEmbed()
      .setColor("#F8F70E")
      .setThumbnail(`https://cdn.discordapp.com/avatars/${avatarUrl}.jpeg`)
      .setTitle(`Votre compte à bien été crédité de 2000 ChocoCoins`)
      .setFields({
        name: `Nouveau montant de ChocoCoins : `,
        value: `${profileData.chococoins + 2000} ©`,
      });
    return unifiedInteraction.message.reply({
      embeds: [dailySuccessfullEmbed],
    });
  },
};
