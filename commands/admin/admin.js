const MessageUtils = require("../../utils/messageutils");
const Admins = require('../../db/admins');
const config = require("../../config.json");  

/**
 * This command enables superusers to grant or remove admin access to members of the channel. 
 */
module.exports = class AdminCommand {

    constructor() {
        this.name = 'admin',
        this.alias = ['a'],
        this.usage = '!admin [discord user]'
        this.disc = "Grants or removes admin rights from a discord user.";
    }

    run(client, msg, args) {

        var name = msg.author.username + "#" + msg.author.discriminator;

        // Only superusers are allowed to change admin status of users
        if (!config.discord.superusers.includes(name)) {
            msg.channel.send(MessageUtils.error("Unauthorized access."));
            return;
        }
        if (args.length < 1) {
            msg.channel.send(MessageUtils.error("No username specified."));
            return;
        }
        var adminName = args[0].toLowerCase();
        if (config.discord.superusers.includes(adminName)) {
            msg.channel.send(MessageUtils.error("Cannot modify admin status of superuser {" + adminName + "}."));
            return;
        }

        (async () => {
            var admin = await Admins.getAdmin(adminName)
            if (admin == null) {
                // Check if the user actually exists in the channel before attempting to add
                var members = msg.channel.guild.members.array();
                for(var i in members) { 
                    var username = (members[i].user.username + "#" + members[i].user.discriminator).toLowerCase();
                    if (username === adminName) {
                        Admins.insertAdmin(adminName);
                        msg.channel.send("Granted admin privileges to: " + adminName + ".");
                        return;
                    }
                }
                msg.channel.send(MessageUtils.error("Could not find {" + args[0] + "} in the channel."));
            } else {
                Admins.deleteAdmin(adminName);
                msg.channel.send("Removed admin privileges from: " + adminName + ".");
            }
        })();
    }
}