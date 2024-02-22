const { Colors, EmbedBuilder } = require("discord.js");

class ErrorEmbed extends EmbedBuilder {
    constructor() {
        super()
        this.title = "Error!"
        this.color = Colors.Red
    }
    setError(errorFieldJSON) {
        this.addFields(errorFieldJSON);
        return this;
    }
}
module.exports = ErrorEmbed;