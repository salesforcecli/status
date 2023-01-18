const fs = require('fs');

const repositories = require('./repositories.json');

const readme = fs.readFileSync('./README.md', 'utf8');

const HEADER = '<!-- Repositories -->\n';
const repositoryIndex = readme.indexOf(HEADER);

let contents = `${HEADER}\n`;

const list = repositories;

contents += '| Repository | Type | Package | Released |\n';
contents += '|------------|:----:|---------|----------|\n';

/**
 * Get the img.shield badge as <type>.
 * @param {name: string, type: 'package' | 'library' } package
 */
function getTypeBadge(package) {
  const color = package.type === 'plugin' ? 'blue' : package.type === 'library' ? 'yellowgreen' : 'orange';

  return `![type](https://img.shields.io/badge/%20-${package.type}-${color})`;
}

/**
 * Get the img.shield badge as <name><version>.
 * @param {name: string, type: 'package' | 'library' } package
 */
function getPackageBadge(package) {
  if(package.type !== 'GHA') {
    return `[![NPM](https://img.shields.io/npm/v/${package.name}.svg?label=${package.name})](https://www.npmjs.com/package/${package.name})`;
  }
}

for (const repo of list) {
  const url = repo.url;
  // Only supports github repositories right now
  const [_, ghOrg, ghRepoName] = url.match(/https:\/\/github.com\/(\w+)\/([\w_-]+)/);
  const slug = `${ghOrg}/${ghRepoName}`;
  const supportsReleases = typeof repo.supportsReleases === 'boolean' ? repo.supportsReleases : true;

  const repository = `[${slug}](https://github.com/${slug})`;
  const type = repo.packages.map(getTypeBadge).join('<br>');
  const packages = repo.packages.map(getPackageBadge).join('<br>');
  const released = !repo.private && supportsReleases ? `![GitHub Release Date](https://img.shields.io/github/release-date/${slug}?color=ffc16b&label=%20)` : '';

  const tableSegments = [repository, type, packages, released];
  contents += `| ${tableSegments.join(' | ')} |\n`;
}

contents += '\n';

const newContents = readme.substring(0, repositoryIndex) + contents;
fs.writeFileSync('README.md', newContents, '')
