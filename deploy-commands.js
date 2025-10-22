import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("time")
    .setDescription(
      "Convert one or two times to a Discord time or time range format"
    )
    .addStringOption((option) =>
      option
        .setName("start")
        .setDescription("Start time, e.g. '3pm', 'now'")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("end")
        .setDescription("End time, e.g. '6pm', 'now', 'in 2 hours'")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("datetime")
    .setDescription("Convert text to Discord full date and time format")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription(
          "Examples: 'now', 'in 2 hours', '3pm tomorrow', 'next Friday', '2025-10-22 14:00'"
        )
        .setRequired(true)
    ),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
  body: commands,
});

console.log("✅ Slash command registered!");
