export type AppConfigEntry = {
    system_url: string;
    base_url: string;
    slug: string;
    name: string;
};

export type AppConfig = {
    [appId: number]: AppConfigEntry;
};
