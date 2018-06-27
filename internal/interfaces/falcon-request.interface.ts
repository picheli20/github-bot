export interface IFalconRequest {
  skin: string;
  domain: string;
  branch: string;
  payload: {
    slug: string;
  };
  url: string;
}
