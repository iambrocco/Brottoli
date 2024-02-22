const Client = require("../Structures/Client");

module.exports = {
    name: "error",
    /**
     * 
     * @param {import("discord.js").ErrorEvent} error 
     */
    async execute(error) {
        console.log("An Error Occured:", error.message);
    }
}