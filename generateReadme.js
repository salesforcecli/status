const fs = require('fs');

const repositories = require('./repositories.json');
const readme = fs.readFileSync('./README.md', 'utf8');
const HEADER = '<!-- Repositories -->\n';
const repositoryIndex = readme.indexOf(HEADER);


const repoToTableRow = (repo) => {
  const url = repo.url;
  // Only supports github repositories right now
  const [_, ghOrg, ghRepoName] = url.match(
    /https:\/\/github.com\/(\w+)\/([\w_-]+)/
  );
  const slug = `${ghOrg}/${ghRepoName}`;
  const supportsReleases =
    typeof repo.supportsReleases === "boolean" ? repo.supportsReleases : true;

  const repository = `[${slug}](https://github.com/${slug})`;
  const type = repo.packages.map(getTypeBadge).join("<br>");
  const packages = repo.packages.map(getPackageBadge).join("<br>");
  const released =
    !repo.private && supportsReleases
      ? `![GitHub Release Date](https://img.shields.io/github/release-date/${slug}?color=ffc16b&label=%20)`
      : "";

  const tableSegments = [repository, type, packages, released];
  return `| ${tableSegments.join(" | ")} |`;
};

const colorMap = new Map([
  ['library', 'yellowgreen'],
  ['plugin', 'blue'],
  ['GHA', 'orange'],
  ['config', 'lightblue'],
  ['template', 'purple'],
])
/**
 * Get the img.shield badge as <type>.
 * @param {name: string, type: 'package' | 'library' } package
 */
function getTypeBadge(package) {
  const color = colorMap.get(package.type) ?? 'lightgrey';
  return `![type](https://img.shields.io/badge/%20-${package.type}-${color})`;
}

/**
 * Get the img.shield badge as <name><version>.
 * @param {name: string, type: 'package' | 'library' } package
 */
function getPackageBadge(package) {
  if(package.type !== 'GHA' && package.name) {
    return `[![NPM](https://img.shields.io/npm/v/${package.name}.svg?label=${package.name})](https://www.npmjs.com/package/${package.name})`;
  }
}

const contents = [
  HEADER,
  "| Repository | Type | Package | Released |",
  "|------------|:----:|---------|----------|",
  ...repositories.map(repoToTableRow),
];

const newContents = readme.substring(0, repositoryIndex) + contents.join('\n') + '\n';
fs.writeFileSync('README.md', newContents, '')
