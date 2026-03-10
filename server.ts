import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const resend = new Resend(process.env.RESEND_API_KEY);

  app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      await resend.emails.send({
        from: 'SomnoAI <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome to SomnoAI Digital Sleep Lab',
        html: '<p>Thank you for subscribing to SomnoAI Digital Sleep Lab. Stay tuned for updates.</p>',
      });

      res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
