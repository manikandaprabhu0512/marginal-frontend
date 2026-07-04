export const streamAnswer = async (notebookId, answer, setMessages) => {
  const words = answer.split(" ");
  const id = `tmp-${Date.now()}`;

  setMessages((prev) => [
    ...prev,
    {
      id,
      notebookId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    },
  ]);

  let displayed = "";

  for (let i = 0; i < words.length; i += 3) {
    displayed += words.slice(i, i + 3).join(" ") + " ";

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: displayed.trim() } : msg,
      ),
    );

    await new Promise((r) => setTimeout(r, 30));
  }
};
