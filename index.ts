import fs from "fs";
import inquirer from "inquirer";
import open from "open";
import { buildLogoUrl } from "./urlGenerator.js";
import { exit } from "process";
import { appConfigs } from "./data/appConfigs.js";

type ParsedLogo = {
    app_id: number;
    logo_id: number;
    done?: boolean;
};

const PARSED_JSON = "data/new_mismatch.json";

let parsedData: ParsedLogo[] = [];

// Load or parse JSON
function loadParsedData() {
    if (fs.existsSync(PARSED_JSON)) {
        parsedData = JSON.parse(fs.readFileSync(PARSED_JSON, "utf-8"));
    } else {
        console.error(
            "Parsed JSON file not found. Please run the parser first."
        );
        exit(0);
    }
}

function saveParsedData() {
    fs.writeFileSync(PARSED_JSON, JSON.stringify(parsedData, null, 2));
}

async function main() {
    loadParsedData();

    console.clear();

    const { autoOpen }: { autoOpen: boolean } = await inquirer.prompt([
        {
            name: "autoOpen",
            type: "confirm",
            message: "Automatically open URL on Next?",
            default: false,
        },
    ]);

    const uniqueAppIds = [...new Set(parsedData.map((e) => e.app_id))];

    const { selectedAppId }: { selectedAppId: number } = await inquirer.prompt([
        {
            name: "selectedAppId",
            type: "list",
            message: "Select App ID:",
            choices: uniqueAppIds.map((id) => ({
                name: id.toString(),
                value: id,
            })),
        },
    ]);

    console.clear();

    const { loginAppId }: { loginAppId: boolean } = await inquirer.prompt([
        {
            name: "loginAppId",
            type: "confirm",
            message: "Login into merchant before starting?",
            default: false,
        },
    ]);

    if (loginAppId) {
        const selectedApp = appConfigs[selectedAppId];
        open(`https://system.smake.com/en/apps?q=${selectedApp.slug}`)
    }

    const appLogos = parsedData.filter((l) => l.app_id === selectedAppId);
    let firstCall = true;
    let index = 0;

    while (true) {
        const logo = appLogos[index];
        if (!logo) break;

        const url = buildLogoUrl(logo.app_id, logo.logo_id);

        console.clear();

        if (firstCall) {
            if (url && autoOpen) {
                await open(url);
            }
            firstCall = false;
        }

        console.log(
            `🧵 [${index + 1}/${appLogos.length}] App: ${logo.app_id} | Logo: ${
                logo.logo_id
            }`
        );
        console.log(`🔗 URL: ${url ?? "❌ Not available (missing slug?)"}`);
        console.log(`✅ Done: ${logo.done === true ? "Yes" : "No"}`);

        const { action } = await inquirer.prompt([
            {
                name: "action",
                type: "list",
                message: "What do you want to do?",
                choices: [
                    { name: "Next", value: "next" },
                    { name: "Previous", value: "prev" },
                    {
                        name: logo.done ? "Mark as NOT Done" : "Mark as Done",
                        value: "toggle",
                    },
                    { name: "Exit", value: "exit" },
                ],
            },
        ]);

        if (action === "next") {
            index = Math.min(index + 1, appLogos.length - 1);
            if (autoOpen && url && !logo.done) {
                await open(url);
            }
        }

        if (action === "prev") index = Math.max(index - 1, 0);

        if (action === "toggle") {
            logo.done = !logo.done;
            saveParsedData();
        }

        if (action === "exit") break;
    }

    console.log("👋 Exiting CLI");
}

main();
