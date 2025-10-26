import { Client, GatewayIntentBits } from "discord.js";
import * as chrono from "chrono-node";
import { DateTime } from "luxon";
import dotenv from "dotenv";
import fs from "fs";
import userTimezones from "./user-timezones.js";
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Helper function: Convert JS Date to user's timezone-aware Date
function parseTimeInUserTimezone(jsDate, timezone) {
  return DateTime.fromObject(
    {
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
      hour: jsDate.getHours(),
      minute: jsDate.getMinutes(),
      second: jsDate.getSeconds(),
    },
    { zone: timezone }
  ).toJSDate();
}

// Helper function: Save user timezones to file
function saveUserTimezones() {
  fs.writeFileSync(
    "./user-timezones.js",
    `const userTimezones = ${JSON.stringify(
      userTimezones,
      null,
      2
    )};\nexport default userTimezones;\n`
  );
}

// Helper function: Parse natural language time input
function parseNaturalLanguageTime(input, userTimezone) {
  const referenceDate = DateTime.now().setZone(userTimezone).toJSDate();
  const results = chrono.parse(input, referenceDate);

  if (results.length === 0) {
    return null;
  }

  const parsedDate = results[0].start?.date();
  return parseTimeInUserTimezone(parsedDate, userTimezone);
}

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
    saveUserTimezones();

    await interaction.reply({
      content: `✅ Timezone set to \`${tz}\` for your account!`,
      ephemeral: true,
    });
    return;
  }
  // Handle /time command
  if (interaction.commandName === "time") {
    const startInput = interaction.options.getString("start");
    const endInput = interaction.options.getString("end");
    const userId = interaction.user.id;
    const userTz = userTimezones[userId] || "UTC";

    // Parse start time
    const startDate = parseNaturalLanguageTime(startInput, userTz);
    if (!startDate) {
      await interaction.reply({
        content: "❌ Couldn't understand the start time.",
        ephemeral: true,
      });
      return;
    }

    // Parse end time if provided
    let endDate = null;
    if (endInput) {
      endDate = parseNaturalLanguageTime(endInput, userTz);
      if (!endDate) {
        await interaction.reply({
          content: "❌ Couldn't understand the end time.",
          ephemeral: true,
        });
        return;
      }
    }

    // Convert to Unix timestamps
    const unixStart = Math.floor(startDate.getTime() / 1000);
    const unixEnd = endDate ? Math.floor(endDate.getTime() / 1000) : null;

    // Build Discord timestamp reply
    const reply = unixEnd
      ? `<t:${unixStart}:t> → <t:${unixEnd}:t>`
      : `<t:${unixStart}:t>`;

    await interaction.reply({ content: reply });
    return;
  }
  // Handle /datetime command
  if (interaction.commandName === "datetime") {
    const input = interaction.options.getString("input");
    const userId = interaction.user.id;
    const userTz = userTimezones[userId] || "UTC";

    // Parse date/time input
    const referenceDate = DateTime.now().setZone(userTz).toJSDate();
    const results = chrono.parse(input, referenceDate);

    if (results.length === 0) {
      await interaction.reply({
        content: "❌ Couldn't understand that time.",
        ephemeral: true,
      });
      return;
    }

    // Parse start and optional end times
    const result = results[0];
    const parsedStart = result.start?.date();
    const parsedEnd = result.end?.date();

    const start = parseTimeInUserTimezone(parsedStart, userTz);
    const end = parsedEnd ? parseTimeInUserTimezone(parsedEnd, userTz) : null;

    // Convert to Unix timestamps
    const unixStart = Math.floor(start.getTime() / 1000);
    const unixEnd = end ? Math.floor(end.getTime() / 1000) : null;

    // Build Discord timestamp reply
    const reply = unixEnd
      ? `<t:${unixStart}:f> → <t:${unixEnd}:f>`
      : `<t:${unixStart}:f>`;

    await interaction.reply({ content: reply });
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
