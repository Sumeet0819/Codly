const test = async () => {
  const response = await fetch("https://wandbox.org/api/list.json");
  const data = await response.json();
  const langs = new Set();
  data.forEach(d => langs.add(d.language));
  console.log([...langs]);
};
test();
