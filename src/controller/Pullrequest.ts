export class Pullrequest {
  number: number;
  branch: string;
  title: string;
  myself: string;
  login: string;
  deployState: 'success';
  loginBase: string;

  pr: any;

  // Todo: create the type for Any
  constructor(ghRequest: any) {
    this.pr = ghRequest.pull_request ? ghRequest.pull_request : ghRequest;
    this.deployState = ghRequest.deployment_status ? ghRequest.deployment_status.state : '';

    this.number = this.pr.number;
    this.branch = this.pr.head.ref;
    this.title = this.pr.title;
    this.myself = this.pr.user.login;
    this.login = this.pr.head.user.login;
    this.loginBase = this.pr.base.user.login;
  }

  isMerged() {
    return !!this.pr.merged_at;
  }
}
