import { appConfigs } from "./data/appConfigs";

/**
 * Builds the logo URL for a given appId and logoId
 * @param appId - Application ID
 * @param logoId - Logo ID
 * @returns Full URL to the logo or null if config is missing
 */
export function buildLogoUrl(appId: number, logoId: number): string | null {
    const config = appConfigs[appId];
    if (!config || !config.slug) return null;

    return `${config.base_url}/${config.slug}/catalog/logos/${logoId}`;
}
