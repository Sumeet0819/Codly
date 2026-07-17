const test = async () => {
  try {
    const response = await fetch("https://api.codex.jaagrav.in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "print('hello')", language: "py", input: "" })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e.message);
  }
};
test();
