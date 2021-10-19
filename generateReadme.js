const fs = require('fs');

const repositories = require('./repositories.json');

const readme = fs.readFileSync('./README.md', 'utf8');

const HEADER = '<!-- Repositories -->\n';
const repositoryIndex = readme.indexOf(HEADER);

let contents = `${HEADER}\n`;

const list = repositories;

contents += '| Repository | Package | Released | Status |\n';
contents += '|------------|---------|----------|--------|\n';

/**
 * Get the img.shield badge as <type><name><version>.
 * @param {name: string, type: 'package' | 'library' | 'orb'} package
 */
function getPackageBadge(package) {
  let row = ''
  const color = package.type === 'plugin' ? 'blue' : package.type === 'library' ? 'yellowgreen' : 'orange';
  row += `![type](https://img.shields.io/badge/%20-${package.type}-${color})`;
  if (package.type === 'orb') {
    row += `[![CircleCI Orb Version](https://img.shields.io/badge/endpoint.svg?label=${package.name}&url=https://badges.circleci.io/orb/${package.name})](https://circleci.com/orbs/registry/orb/${package.name})`
  } else {
    row += `[![NPM](https://img.shields.io/npm/v/${package.name}.svg?label=${package.name})](https://www.npmjs.com/package/${package.name})`;
  }
  return row;
}

for (const repo of list) {
  const url = repo.url;
  // Only supports github repositories right now
  const [_, ghOrg, ghRepoName] = url.match(/https:\/\/github.com\/(\w+)\/([\w_-]+)/);
  const slug = `${ghOrg}/${ghRepoName}`;
  const supportsReleases = typeof repo.supportsReleases === 'boolean' ? repo.supportsReleases : true;

  const repository = `[${slug}](https://github.com/${slug})`;
  const packages = repo.packages.map(getPackageBadge).join('<br>');
  const released = !repo.private && supportsReleases ? `![GitHub Release Date](https://img.shields.io/github/release-date/${slug}?color=ffc16b&label=%20)` : '';
  const status = !repo.private ? `[![circleci](https://circleci.com/gh/${slug}.svg?style=svg)](https://app.circleci.com/pipelines/github/${slug})` : '';

  const tableSegments = [ repository, packages, released, status ]
  contents += `| ${tableSegments.join(' | ')} |\n`;
}

contents += '\n';

const newContents = readme.substring(0, repositoryIndex) + contents;
fs.writeFileSync('README.md', newContents, '')
