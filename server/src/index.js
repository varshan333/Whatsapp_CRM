require('dotenv').config();
const app = require('./index_app');
const db = require('./db');
const leadsRoutes = require('./routes/leads');
const convRoutes = require('./routes/conversations');
const msgRoutes = require('./routes/messages');
const tplRoutes = require('./routes/templates');
const clientsRoutes = require('./routes/clients');
const usersRoutes = require('./routes/users');
const webhookRoutes = require('./routes/webhook');
const { dequeueMessage } = require('./queue');
const { sendTemplateMessage } = require('./providers/whatsapp');

const PORT = process.env.PORT || 4000;

app.use('/api/leads', leadsRoutes);
app.use('/api/conversations', convRoutes);
app.use('/api/messages', msgRoutes);
app.use('/api/templates', tplRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/users', usersRoutes);
app.use('/webhook', webhookRoutes);

// Start DB, server and worker
db.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });

    // start a simple background worker to process outbound queue
    (async function worker() {
      console.log('Queue worker started');
      while (true) {
        try {
          const job = await dequeueMessage();
          if (!job) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          if (job.type === 'outbound') {
            try {
              await sendTemplateMessage(job.to, job.templateName, job.language || 'en_US', job.components || []);
              console.log('Sent outbound', job.id);
            } catch (e) {
              console.error('Failed to send outbound', e.message);
              // simple retry: wait then continue (production: backoff + cap)
              await new Promise((r) => setTimeout(r, 2000));
            }
          }
        } catch (e) {
          console.error('Worker error', e);
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    })();
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
