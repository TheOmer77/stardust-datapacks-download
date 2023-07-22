import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

import type { ReadableStream } from 'stream/web';
import type { PartialRelease } from './types';

declare global {
  interface Response {
    readonly body: ReadableStream<Uint8Array> | null;
  }
}

const getDatapack = async (
  name: string,
  repoUrl: string,
  mcVersion: string,
  location?: string,
) => {
  try {
    const releasesRes = await fetch(
        `https://api.github.com/repos/${repoUrl}/releases`,
      ),
      releases: PartialRelease[] | { message: string } =
        await releasesRes.json();
    if (!releasesRes.ok && !Array.isArray(releases))
      throw new Error(releases.message);

    const releaseForVer = (releases as PartialRelease[])?.find?.(release =>
      release.name.includes(mcVersion),
    );
    const asset = releaseForVer?.assets?.find?.(asset =>
      asset.name.includes(mcVersion),
    );
    if (!releaseForVer || !asset)
      throw new Error(
        `A ${name} release for Minecraft ${mcVersion} couldn't be found :(`,
      );
    const { name: fileName, browser_download_url: fileUrl } = asset;
    console.log(
      `Found ${name} release for Minecraft ${mcVersion}: ${fileName}, downloading...`,
    );

    const { body, ok, status, statusText } = await fetch(fileUrl);
    if (!ok)
      throw new Error(
        status && statusText
          ? [status, statusText].join(' ')
          : 'Request failed',
      );
    if (!body)
      throw new Error(
        `Something went wrong while reading the file ${fileName}.`,
      );

    const fileStream = fs.createWriteStream(
      path.join(location || process.cwd(), fileName),
    );
    await finished(Readable.fromWeb(body).pipe(fileStream));

    console.log(
      `Successfully downloaded ${name} release for Minecraft ${mcVersion}.`,
    );
  } catch (err) {
    console.error(
      `Couldn't download ${name} release for Minecraft ${mcVersion}:`,
      err instanceof Error ? err.message : err,
    );
  }
};

export default getDatapack;
