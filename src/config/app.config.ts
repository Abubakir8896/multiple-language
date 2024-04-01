declare interface AppConfigOptions {
  port: number;
  host: string;
}

export const appConfig: AppConfigOptions = {
  port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 1005,
  host: process.env.APP_HOST,
};
