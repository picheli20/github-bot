import { IProject } from '../interfaces/projects'
const pe = process.env;

let projectsInfos: IProject[] = [];

if (pe.PROJECTS_INFOS){
  const { projects } = JSON.parse(pe.PROJECTS_INFOS as string);
  projectsInfos = projects;
}

export const projects: IProject[] = [ ...projectsInfos ];
