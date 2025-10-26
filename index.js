import { Client, GatewayIntentBits } from "discord.js";
import * as chrono from "chrono-node";
import { DateTime } from "luxon";
import dotenv from "dotenv";
import fs from "fs";
import userTimezones from "./user-timezones.js";
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  // Handle /settimezone command
  if (interaction.commandName === "settimezone") {
    const tz = interaction.options.getString("timezone");
    const userId = interaction.user.id;
    // Validate: only allow Etc/GMT offsets
    if (!tz || !/^Etc\/GMT([+-]?\d{1,2})?$/.test(tz)) {
      await interaction.reply({
        content:
          "❌ Invalid timezone format. Please select a UTC offset from the dropdown.",
        ephemeral: true,
      });
      return;
    }
    userTimezones[userId] = tz;
    // Save to file
    fs.writeFileSync(
      "./user-timezones.js",
      `const userTimezones = ${JSON.stringify(
        userTimezones,
        null,
        2
      )};\nexport default userTimezones;\n`
    );
    await interaction.reply({
      content: `✅ Timezone set to \`${tz}\` for your account!`,
      ephemeral: true,
    });
    return;
  }
  if (interaction.commandName === "time") {
    const startInput = interaction.options.getString("start");
    const endInput = interaction.options.getString("end");
    const userId = interaction.user.id;
    const userTz = userTimezones[userId] || "UTC";
    // Use Luxon to get now in user's timezone
    const now = DateTime.now().setZone(userTz).toJSDate();

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
    // Convert to user's timezone
    startDate = DateTime.fromJSDate(startDate).setZone(userTz).toJSDate();

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
      endDate = DateTime.fromJSDate(endDate).setZone(userTz).toJSDate();
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
    const userId = interaction.user.id;
    const userTz = userTimezones[userId] || "UTC";
    const now = DateTime.now().setZone(userTz).toJSDate();
    const results = chrono.parse(input, now);
    if (results.length === 0) {
      await interaction.reply({
        content: "❌ Couldn't understand that time.",
        ephemeral: true,
      });
      return;
    }
    const result = results[0];
    let start = result.start?.date();
    let end = result.end?.date();
    start = DateTime.fromJSDate(start).setZone(userTz).toJSDate();
    if (end) {
      end = DateTime.fromJSDate(end).setZone(userTz).toJSDate();
    }
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
