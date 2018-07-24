const pe = process.env;
let botConfig: IBotConfig = {};

if (pe.PROJECTS_INFOS) {
  const { bot } = JSON.parse(pe.PROJECTS_INFOS as string);
  botConfig = bot;
}

interface IBotConfig {
  url?: string;
}

export const bot = {
  ...botConfig,
};
