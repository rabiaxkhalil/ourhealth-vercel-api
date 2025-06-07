import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { entries } = req.body;

  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: "Missing or invalid 'entries'" });
  }

  const prompt = `Turn these weekly journal entries into a short, supportive pediatric storybook paragraph:\n\n${entries.join(
    "\n"
  )}\n\nStory:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const story = completion.choices[0].message.content.trim();
    res.status(200).json({ story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Story generation failed" });
  }
}

