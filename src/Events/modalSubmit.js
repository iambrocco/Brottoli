const { EmbedBuilder } = require("discord.js");
const { inspect } = require('util');
const vm = require('vm');
module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId == "achievementModal") {
        const Icons = require("../Data/minecraft.json").Icons;
        const yellowText =
          interaction.fields.getTextInputValue("yellowTextInput");
        const whiteText =
          interaction.fields.getTextInputValue("whiteTextInput");
        const iconText = interaction.fields.getTextInputValue("iconInput");
        for (const icon in Icons) {
          const element = Icons[icon];
          if (!iconText || iconText.toLowerCase() != element.toLowerCase()) {
            var image = `https://minecraftpanda.com/tools/achievement-generator/output?icon=1&title=${encodeURI(
              yellowText
            )}&text=${encodeURI(whiteText)}`;
          }
          if (iconText.toLowerCase() == element.toLowerCase()) {
            var image = `https://minecraftpanda.com/tools/achievement-generator/output?icon=${
              parseInt(icon) + 1
            }&title=${encodeURI(yellowText)}&text=${encodeURI(whiteText)}`;
            break;
          }
        }

        await interaction.reply({embeds: [new EmbedBuilder().setImage(image)]});
      }
      if (interaction.customId == "evalModal") {
        const code = await interaction.fields.getTextInputValue("codeInput");
        let evaled;

        try {
            evaled = await vm.runInNewContext(code);
          
        } catch (err) {
          const errEmbed = new EmbedBuilder()
            .setColor('#f4424b')
            .setTitle('Eval Result')
            .addFields({name:'Error while evaluating', value:`\`\`\`bash\n${err}\n\`\`\``})
            
            .setTimestamp();
            return interaction.reply({embeds:[errEmbed]});
        }

        const output = inspect(evaled, { depth: 0 });


        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Eval Result')
            .addFields({name:'Input', value:`\`\`\`js\n${code}\n\`\`\``}, {
              name:'Output', value:`\`\`\`js\n${output}\n\`\`\``
            })
            
            .setTimestamp();
          await  interaction.reply({embeds: [embed]})
      }
    }
  },
};
