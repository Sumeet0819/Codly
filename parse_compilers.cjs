const fs = require('fs');
const data = JSON.parse(fs.readFileSync('compilers.json', 'utf8'));
const wanted = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#', 'Go', 'Rust'];
const result = {};
wanted.forEach(lang => {
  const compilers = data.filter(d => d.lang === lang).map(d => d.compiler);
  result[lang] = compilers[0]; // just pick the first one, or latest
  // Let's pick the latest or a standard one for each
});
console.log(JSON.stringify(result, null, 2));
// To be safer, let's print all compilers for wanted languages
const detailed = {};
wanted.forEach(lang => {
  detailed[lang] = data.filter(d => d.lang === lang).map(d => d.compiler);
});
console.log(JSON.stringify(detailed, null, 2));
