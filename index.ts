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
const SEGMENT_SIZE = 50;

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
        await open(`${selectedApp.system_url}/en/apps?q=${selectedApp.slug}`);

        const { confirmStart }: { confirmStart: boolean } =
            await inquirer.prompt([
                {
                    name: "confirmStart",
                    type: "confirm",
                    message:
                        "Press Enter once you are logged in to continue...",
                    default: true,
                },
            ]);

        if (!confirmStart) {
            console.log("Aborted by user.");
            process.exit(0);
        }
    }

    const fullAppLogos = parsedData.filter((l) => l.app_id === selectedAppId);

    const totalSegments = Math.ceil(fullAppLogos.length / SEGMENT_SIZE);
    const segmentChoices = [];

    for (let i = 0; i < totalSegments; i++) {
        const start = i * SEGMENT_SIZE + 1;
        const end = Math.min((i + 1) * SEGMENT_SIZE, fullAppLogos.length);
        segmentChoices.push({
            name: `Segment ${i + 1} (${start}-${end})`,
            value: i,
        });
    }

    segmentChoices.push({ name: "Show All", value: -1 });

    const { selectedSegment }: { selectedSegment: number } =
        await inquirer.prompt([
            {
                name: "selectedSegment",
                type: "list",
                message: "Select a Segment:",
                choices: segmentChoices,
            },
        ]);

    let appLogos: ParsedLogo[] = [];

    if (selectedSegment === -1) {
        appLogos = fullAppLogos;
    } else {
        const startIndex = selectedSegment * SEGMENT_SIZE;
        const endIndex = Math.min(
            startIndex + SEGMENT_SIZE,
            fullAppLogos.length
        );
        appLogos = fullAppLogos.slice(startIndex, endIndex);
    }

    let firstCall = true;
    let index = 0;
    let showDone = true;

    while (true) {
        const filteredLogos = showDone
            ? appLogos
            : appLogos.filter((l) => !l.done);

        if (filteredLogos.length === 0) {
            console.clear();
            console.log("🎉 All logos are marked as done. Exiting CLI.");
            break;
        }

        // Clamp index in case it's out of bounds after filter change
        index = Math.min(index, filteredLogos.length - 1);
        const logo = filteredLogos[index];
        const url = buildLogoUrl(logo.app_id, logo.logo_id);

        console.clear();

        if (firstCall && autoOpen && url && !logo.done) {
            await open(url);
            firstCall = false;
        }

        console.log(
            `🧵 [${index + 1}/${filteredLogos.length}] App: ${
                logo.app_id
            } | Logo: ${logo.logo_id}`
        );
        console.log(`🔗 URL: ${url ?? "❌ Not available (missing slug?)"}`);
        console.log(`✅ Done: ${logo.done === true ? "Yes" : "No"}`);
        console.log(`👁️ Show Done Logos: ${showDone ? "Yes" : "No"}`);

        const { action }: { action: string } = await inquirer.prompt([
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
                    {
                        name: showDone ? "Hide Done Logos" : "Show Done Logos",
                        value: "toggleShowDone",
                    },
                    { name: "Exit", value: "exit" },
                ],
            },
        ]);

        if (action === "next") {
            if (index < filteredLogos.length - 1) {
                index++;
                const nextLogo = filteredLogos[index];
                const nextUrl = buildLogoUrl(nextLogo.app_id, nextLogo.logo_id);
                if (autoOpen && nextUrl && !nextLogo.done) {
                    await open(nextUrl);
                }
            }
        }

        if (action === "prev") {
            if (index > 0) {
                index--;
            }
        }

        if (action === "toggle") {
            // Toggle done in original parsedData (not just filtered)
            const original = parsedData.find(
                (l) => l.app_id === logo.app_id && l.logo_id === logo.logo_id
            );
            if (original) {
                original.done = !original.done;
                saveParsedData();
            }
        }

        if (action === "toggleShowDone") {
            showDone = !showDone;
            index = 0; // Reset index to avoid out-of-bounds
        }

        if (action === "exit") {
            console.log("👋 Exiting CLI");
            break;
        }
    }
}

main();
