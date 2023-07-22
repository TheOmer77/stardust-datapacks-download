export interface PartialRelease {
  name: string;
  assets: {
    name: string;
    browser_download_url: string;
  }[];
}
