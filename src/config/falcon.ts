const pe = process.env;
let falconConfig: IFalconConfig = {};

if (pe.PROJECTS_INFOS){
  const { falcon } = JSON.parse(pe.PROJECTS_INFOS as string)
  falconConfig = falcon;
}

interface IFalconConfig {
  url?: string;
}

export const falcon = {
  ...falconConfig,
};
