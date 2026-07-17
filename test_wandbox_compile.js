const test = async () => {
  try {
    const response = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler: "cpython-3.10.2",
        code: "import sys\nprint(f'Hello {sys.stdin.read().strip()}')",
        stdin: "World"
      })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e.message);
  }
};
test();
