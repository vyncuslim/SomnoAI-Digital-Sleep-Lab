import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'SomnoAI <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
