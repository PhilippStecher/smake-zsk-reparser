export type AppConfigEntry = {
    base_url: string;
    slug: string;
    name: string;
};

export type AppConfig = {
    [appId: number]: AppConfigEntry;
};
