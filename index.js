import { Client, GatewayIntentBits } from "discord.js";
import * as chrono from "chrono-node";
import dayjs from "dayjs";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "time") {
    const startInput = interaction.options.getString("start");
    const endInput = interaction.options.getString("end");
    const now = new Date();

    let startDate, endDate;
    // Parse start
    const startResults = chrono.parse(startInput, now);
    if (startResults.length === 0) {
      await interaction.reply({
        content: "❌ Couldn't understand the start time.",
        ephemeral: true,
      });
      return;
    }
    startDate = startResults[0].start?.date();

    // Parse end if provided
    if (endInput) {
      const endResults = chrono.parse(endInput, now);
      if (endResults.length === 0) {
        await interaction.reply({
          content: "❌ Couldn't understand the end time.",
          ephemeral: true,
        });
        return;
      }
      endDate = endResults[0].start?.date();
    }

    const unixStart = Math.floor(startDate.getTime() / 1000);
    const unixEnd = endDate ? Math.floor(endDate.getTime() / 1000) : null;

    let reply;
    if (unixEnd) {
      reply = `<t:${unixStart}:t> → <t:${unixEnd}:t>`;
    } else {
      reply = `<t:${unixStart}:t>`;
    }
    await interaction.reply({ content: reply });
    return;
  }
  if (interaction.commandName === "datetime") {
    const input = interaction.options.getString("input");
    const now = new Date();
    const results = chrono.parse(input, now);
    if (results.length === 0) {
      await interaction.reply({
        content: "❌ Couldn't understand that time.",
        ephemeral: true,
      });
      return;
    }
    const result = results[0];
    const start = result.start?.date();
    const end = result.end?.date();
    const unixStart = Math.floor(start.getTime() / 1000);
    const unixEnd = end ? Math.floor(end.getTime() / 1000) : null;
    let reply;
    if (unixEnd) {
      reply = `<t:${unixStart}:f> → <t:${unixEnd}:f>`;
    } else {
      reply = `<t:${unixStart}:f>`;
    }
    await interaction.reply({ content: reply });
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
