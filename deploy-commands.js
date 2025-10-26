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
          "Examples: 'now', 'in 2 hours', '3pm tomorrow', '2025-10-22 14:00'"
        )
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("settimezone")
    .setDescription("Set your timezone for time conversions")
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("Select your UTC offset")
        .setRequired(true)
        .addChoices(
          { name: "UTC-12", value: "Etc/GMT+12" },
          { name: "UTC-11", value: "Etc/GMT+11" },
          { name: "UTC-10", value: "Etc/GMT+10" },
          { name: "UTC-9", value: "Etc/GMT+9" },
          { name: "UTC-8", value: "Etc/GMT+8" },
          { name: "UTC-7", value: "Etc/GMT+7" },
          { name: "UTC-6", value: "Etc/GMT+6" },
          { name: "UTC-5", value: "Etc/GMT+5" },
          { name: "UTC-4", value: "Etc/GMT+4" },
          { name: "UTC-3", value: "Etc/GMT+3" },
          { name: "UTC-2", value: "Etc/GMT+2" },
          { name: "UTC-1", value: "Etc/GMT+1" },
          { name: "UTC±0", value: "Etc/GMT" },
          { name: "UTC+1", value: "Etc/GMT-1" },
          { name: "UTC+2", value: "Etc/GMT-2" },
          { name: "UTC+3", value: "Etc/GMT-3" },
          { name: "UTC+4", value: "Etc/GMT-4" },
          { name: "UTC+5", value: "Etc/GMT-5" },
          { name: "UTC+6", value: "Etc/GMT-6" },
          { name: "UTC+7", value: "Etc/GMT-7" },
          { name: "UTC+8", value: "Etc/GMT-8" },
          { name: "UTC+9", value: "Etc/GMT-9" },
          { name: "UTC+10", value: "Etc/GMT-10" },
          { name: "UTC+11", value: "Etc/GMT-11" },
          { name: "UTC+12", value: "Etc/GMT-12" }
        )
    ),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
  body: commands,
});

console.log("✅ Slash command registered!");
