const fs = require('fs');
const data = JSON.parse(fs.readFileSync('compilers.json', 'utf8'));
const wanted = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#', 'Go', 'Rust'];
const result = {};
wanted.forEach(lang => {
  const compilers = data.filter(d => d.lang === lang).map(d => d.name);
  // filter out "head" versions if possible, or just use the first non-head version
  const stable = compilers.find(c => !c.includes('head')) || compilers[0];
  result[lang] = stable;
});
console.log(JSON.stringify(result, null, 2));
