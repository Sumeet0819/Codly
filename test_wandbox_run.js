const test = async () => {
  try {
    const response = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler: "nodejs-20.17.0",
        code: "console.log('Hello');\nconsole.error('Err');",
        stdin: ""
      })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e.message);
  }
};
test();
