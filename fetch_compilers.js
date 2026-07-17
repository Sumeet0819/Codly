const fs = require('fs');
const test = async () => {
  const response = await fetch("https://wandbox.org/api/list.json");
  const data = await response.json();
  const compilers = data.map(d => ({ lang: d.language, name: d.name, compiler: d.compiler }));
  fs.writeFileSync('compilers.json', JSON.stringify(compilers, null, 2));
};
test();
