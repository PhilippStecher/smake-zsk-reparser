# 🔍 Logo Verification CLI

A powerful interactive CLI tool built with **Node.js**, **Inquirer**, and **TypeScript-compatible JS** to review and mark logo mismatches across various app IDs. It loads parsed data from a JSON file and provides a visual workflow for reviewing logo URLs, marking them as done/undone, and optionally opening the logo URLs in your browser automatically.

---

## 📦 Features

-   ✅ Interactive selection of app IDs
-   ✅ Mark/unmark logos as reviewed
-   ✅ Navigate forward/backward through logo entries
-   🌐 Optional automatic URL opening in your browser
-   💾 Persistent state via JSON file

---

## 📁 Project Structure

```
.
├── data/
│   ├── new_mismatch.json   # Contains parsed logos
│   └── appConfigs.ts
├── types/
│   └── AppConfig.ts
├── urlGenerator.ts         # Contains buildLogoUrl(appId, logoId)
└── index.ts                # Main CLI script
```

---

## 🔧 Installation

```bash
git clone https://github.com/your-user/smake-zsk-reparser.git
cd logo-verification-cli
nvm use 22
npm install
```

> Requires Node.js v18+ for compatibility with `.findLastIndex`.

---

## ▶️ Usage

Run the CLI via:

```bash
npm run dev
```

### On Startup

You will be prompted with:

```
❓ Automatically open URL on Next? (Y/n)
```

-   If enabled, each time you press "Next", the logo URL is opened in your default browser automatically.

---

## 📄 JSON Format

Your `new_mismatch.json` must follow this structure:

```json
[
    {
        "app_id": 123,
        "logo_id": 456,
        "done": false
    },
    {
        "app_id": 789,
        "logo_id": 321
    }
]
```

> The `done` field is optional and will be updated automatically when you toggle the status.

---

## 🌍 URL Generation

You need to provide your own `buildLogoUrl(appId, logoId)` function in `urlGenerator.js`. Example:

```js
export function buildLogoUrl(appId, logoId) {
    return `https://yoururl.com/apps/${appId}/logos/${logoId}.png`;
}
```

---

## 🛠 Dependencies

```json
{
    "inquirer": "^9.2.3",
    "open": "^9.1.0"
}
```

---

## 🧪 Example CLI Flow

```bash
$ npm run dev

✔ Automatically open URL on Next? … yes
✔ Select App ID: › 123

🧵 [1/45] App: 123 | Logo: 456
🔗 URL: https://yoururl.com/apps/123/logos/456.png
✅ Done: No

❓ What do you want to do?
❯ Next
  Previous
  Mark as Done
  Exit
```

---

## 💾 Saving State

Each time you toggle the "Done" status, your `new_mismatch.json` will be updated automatically with the new state.

---

## 📌 Notes

-   The CLI clears the screen between entries for a clean overview.
-   You can exit anytime via the menu option **"Exit"**.
-   Supports navigation with **Next** and **Previous**.
-   Works best with **UTF-8** terminal and full-width terminal windows.

---

## 🧠 Tip

Want to quickly review all logos visually? Enable **auto-open** and just smash **Enter** to speed through entries!

---

## 🧑‍💻 Author

Developed by [WlanKabL](https://github.com/WlanKabL)

---

## 📝 License

MIT License. Feel free to use, adapt, and contribute!
