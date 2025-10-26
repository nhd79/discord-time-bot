# Discord Time Bot

A Discord bot that converts natural language time expressions into Discord timestamp formats. Supports `/time` (single or range) and `/datetime` (single date/time).

## Features

- `/time`: Convert one or two times to Discord time or time range format.
- `/datetime`: Convert a single date/time to Discord full date and time format.
- `/settimezone`: Set your timezone using a UTC offset dropdown for accurate time conversion.
- Uses [chrono-node](https://github.com/wanasit/chrono) for natural language date parsing.

## Setup

1. **Clone the repository**
2. **Install dependencies**
   ```
   npm install
   ```
3. **Configure environment variables**
   - Create a `.env` file with:
     ```
     DISCORD_TOKEN=your-bot-token
     CLIENT_ID=your-client-id
     ```

## Register Commands

Run the following to register slash commands:

```
node deploy-commands.js
```

## Run the Bot

Start your bot with:

```
node index.js
```

## Example Usage

- `/settimezone timezone: UTC+7` (select from dropdown)
- `/time start: 3pm end: 6pm` → `<t:...:t> → <t:...:t>`
- `/datetime input: next Friday` → `<t:...:f>`

## License

MIT
