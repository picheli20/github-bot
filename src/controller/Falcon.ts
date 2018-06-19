import { IProject } from '../interfaces/projects';
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

  brachToImageTag(b: string) {
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

  shortSkingForm(skinName: string) {
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

  getFalconComponent(deploy = false, image: string | null = null, tag = null, branch: string = '', type: any = null, config = {}) {
    return {
      deploy,
      image,
      tag,
      branch,
      config,
      type
    };
  }

  deploy(pr: Pullrequest, skinInfo: IProject) {
    const skin = this.normalizeSkinName(skinInfo.skinName);
    const componentName = this.getFalconComponentName(skinInfo.skinName);
    const slug = this.getFalconName(this.shortSkingForm(skinInfo.skinName), pr.branch);

    const payload: any = {
      fullOwner: pr.login,
      brand: skinInfo.skinName,
      description: `[xcaliber-bot] Auto generated from ${pr.branch}`,
      expirationTime: 604800, // 07 days
      owner: pr.login,
      fullName: slug,
      slug,
      components: {
        coreapi: this.getFalconComponent(),
        backoffice2: this.getFalconComponent(),
        backoffice3Api: this.getFalconComponent(),
        backoffice3Portal: this.getFalconComponent(),
        frontapi: this.getFalconComponent(),
      },
      config: {
        coreapiDsn: 'tcp://app01-coreapi-stg.bmit.local:6666',
        frontapiUrl: 'https://staging-frontapi.cherrytech.com',
        backoffice3ApiUrl: 'https://staging-backoffice3-api.cherrytech.com',
      },
      enabled: true,
      persistent: false,
      published: false
    }

    payload.components[componentName] =
      this.getFalconComponent(
        true,
        `registry.k8s.xcaliber.io/platform/xcaf/${skin}`,
        null,
        this.brachToImageTag(pr.branch),
        'skin_xcaf',
      );

    return {
      url: config.falcon.url,
      skin,
      link: this.getLink(componentName, slug),
      payload
    };
  }

  destroy(pr: Pullrequest, skinInfo: IProject) {
    const componentName = this.getFalconComponentName(skinInfo.skinName);

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
