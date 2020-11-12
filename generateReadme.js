const fs = require('fs');

const repositories = require('./repositories.json');

const readme = fs.readFileSync('./README.md', 'utf8');

const headers = ['Salesforce CLI Plugins', 'Library Packages', 'Circle CI Orbs'];

const sections = readme.split('## ');

function replaceSection(header) {
  const section = sections.find(section => section.startsWith(header));
  let contents = `## ${header}\n\n`;

  const list = repositories[header];

  if (!list) {
    console.warn(`Can not find list of repositories in repositories.json for header '${header}'`);
    return '';
  }

  contents += '| name | version | last release | status |\n';
  contents += '|------|---------|--------------|--------|\n';

  for (const repo of list) {
    const githubUrl = repo.githubUrl;
    const [_, ghOrg, ghRepoName] = githubUrl.match(/https:\/\/github.com\/(\w+)\/([\w_-]+)/);
    const slug = `${ghOrg}/${ghRepoName}`;
    // Use the @salesforce scope by default. If this needs to be changes, specify the packages directly in the repositories.json.
    const packages = repo.packages || [`@salesforce/${ghRepoName}`];
    
    const name = `[${slug}](https://github.com/${slug})`;
    const versions = packages.map(package => `[![NPM](https://img.shields.io/npm/v/${package}.svg?label=${package})](https://www.npmjs.com/package/${package})`).join('<br>');
    const lastRelease = !repo.private && !repo.noLastRelease ? `![GitHub Release Date](https://img.shields.io/github/release-date/${slug}?color=ffc16b&label=%20)` : '';
    const status = !repo.private ? `[![circleci](https://circleci.com/gh/${slug}.svg?style=svg)](https://app.circleci.com/pipelines/github/${slug})` : '';
    
    const tableSegments = [ name, versions, lastRelease, status ]
    contents += `| ${tableSegments.join(' | ')} |\n`;
  }

  contents += '\n';

  return contents;
}

const mainSection = sections.shift();

const modifiedSections = sections.map(section => {
  const header = section.split('\n')[0];
  const newContents = replaceSection(header);
  // The ## header was replaced in the split.
  return newContents || `## ${section}`;
});

const newContents = [mainSection, ...modifiedSections].join('');

// console.log(newContents);

fs.writeFileSync('README.md', newContents, '')
