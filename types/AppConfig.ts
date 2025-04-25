export type AppConfigEntry = {
    base_url: string;
    slug: string; // to be filled later
    name: string;
};

export type AppConfig = {
    [appId: number]: AppConfigEntry;
};
