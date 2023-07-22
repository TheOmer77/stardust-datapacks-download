import getDatapack from './getDatapack';
import { DATAPACKS } from './constants';

const mcVersion = process.argv[2],
  location = process.argv[3];
if (!mcVersion) {
  console.error(
    'This script must be executed with a Minecraft version number.',
  );
  process.exit(1);
}

console.log(
  `Downloading ${DATAPACKS.map(datapack => datapack.name).join(
    ', ',
  )} for Minecraft ${mcVersion}...`,
);

DATAPACKS.map(({ name, repoUrl }) =>
  getDatapack(name, repoUrl, mcVersion, location),
);
