const pe = process.env;
let screenshotConfig: IScreeshotConfig = {};

if (pe.PROJECTS_INFOS){
  const { screenshot } = JSON.parse(pe.PROJECTS_INFOS as string);
  screenshotConfig = screenshot;
}

interface IScreeshotConfig {
  url?: string;
}

export const screenshot = {
  ...screenshotConfig,
};
