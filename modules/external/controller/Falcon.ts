import { IProject } from '../interfaces/project';
import { Pullrequest } from './Pullrequest';
import { config } from '../config';


class Falcon {

  normalizeSkinName(skinName: string) {
    // normalize cresus name
    switch(skinName) {
      case 'cresuscasino':
        return 'cresus';
      case 'sunmakercasino':
        return 'sunmaker';
      default:
        return skinName;
    }
  }

  branchToImageTag(b: string) {
    return b.toLowerCase().split('/').slice(-1)[0].replace(/[^A-Za-z0-9_.-]+/g, '-').replace(/-{2,}/g, '-');
  }

  getFalconComponentName(skinName: string) {
    switch(skinName) {
      case 'cresuscasino':
        return 'cr-xcaf';
      case 'eurolotto':
        return 'el-xcaf';
      case 'frankfred':
        return 'ff-xcaf';
      case 'vegascasino':
        return 'vc-xcaf';
      case 'sunmakercasino':
        return 'smc-xcaf';
      default:
        return skinName;
    }
  }

  shortSkinForm(skinName: string) {
    switch(skinName) {
      case 'cresuscasino':
        return 'cr';
      case 'eurolotto':
        return 'el';
      case 'frankfred':
        return 'ff';
      case 'vegascasino':
        return 'vc';
      case 'sunmakercasino':
        return 'smc';
      default:
        return skinName;
    }
  }

  getFalconName(componentName: string, ref: string) {
    return `${componentName}-${ref.toLocaleLowerCase()}`;
  }

  deploy(pr: Pullrequest, project: IProject) {
    const skin = this.normalizeSkinName(project.skinName);
    const componentName = this.getFalconComponentName(project.skinName);
    const slug = this.getFalconName(this.shortSkinForm(project.skinName), pr.branch);

    const payload: any = {
      fullOwner: pr.login,
      brand: project.skinName,
      description: `[xcaliber-bot] Auto generated from ${pr.branch}`,
      expirationTime: 604800, // 07 days
      owner: pr.login,
      fullName: slug,
      slug,
      components: {
        [componentName]: {
          deploy: true,
          image: `registry.k8s.xcaliber.io/platform/xcaf/${skin}`,
          tag: null,
          branch: this.branchToImageTag(pr.branch),
          config: {},
          type: 'skin_xcaf',
        },
      },
      config: {
        coreapiDsn: 'tcp://app01-coreapi-stg.bmit.local:6666',
        frontapiUrl: 'https://staging-frontapi.cherrytech.com',
        backoffice3ApiUrl: 'https://staging-backoffice3-api.cherrytech.com',
      },
      enabled: true,
      persistent: false,
      published: false,
    };

    return {
      url: config.falcon.url,
      skin,
      link: this.getLink(componentName, slug),
      payload,
    };
  }

  destroy(pr: Pullrequest, project: IProject) {
    const componentName = this.getFalconComponentName(project.skinName);

    return {
      url: config.falcon.url,
      payload: {
        slug: this.getFalconName(componentName, pr.branch),
      },
    };
  }

  getLink(componentName: string, slug: string) {
    return `http://${componentName}-${slug}.kbox.k8s.xcaliber.io`;
  }
}

export const falcon = new Falcon();
