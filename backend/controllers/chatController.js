const OpenAI = require('openai');
const Message = require('../models/Message');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.chatWithBot = async (req, res) => {
  const { messages } = req.body; // now expecting an array

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages, // pass the full conversation
    });

    const botReply = response.choices[0].message.content;

    // Optionally, save only the latest user and bot message
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    await Message.create({ userMessage: lastUserMsg?.content || '', botResponse: botReply });

    res.json({ reply: botReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};