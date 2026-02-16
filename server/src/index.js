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
      const { dequeueMessage, enqueueMessage } = require('./queue');
      const { Message } = require('./models');
      const providers = require('./providers');

      while (true) {
        try {
          const job = await dequeueMessage();
          if (!job) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          if (job.type === 'outbound') {
            console.log('Processing outbound job', job.messageId);
            // load message
            const msg = await Message.findById(job.messageId).exec();
            if (!msg) {
              console.warn('Message not found for job', job.messageId);
              continue;
            }

            try {
              // call provider
              const resp = await providers[job.provider]?.sendTemplateMessage?.(job.payload.to, job.payload.template.name, job.payload.template.language, job.payload.template.components || []);
              // provider response may include message id
              const providerId = (resp && (resp.messages && resp.messages[0] && resp.messages[0].id)) || resp?.id || null;

              msg.providerMessageId = providerId || msg.providerMessageId;
              msg.status = 'sent';
              msg.attempts = (msg.attempts || 0) + 1;
              msg.lastError = undefined;
              msg.statusHistory = msg.statusHistory || [];
              msg.statusHistory.push({ status: 'sent', timestamp: new Date(), raw: resp });
              await msg.save();
              console.log('Outbound sent for message', msg._id.toString());
            } catch (err) {
              console.error('Outbound send failed for', job.messageId, err && err.message);
              // update attempts and lastError
              msg.attempts = (msg.attempts || 0) + 1;
              msg.lastError = err && err.message ? err.message : String(err);
              msg.statusHistory = msg.statusHistory || [];
              msg.statusHistory.push({ status: 'error', timestamp: new Date(), raw: { message: err && err.message } });

              if (job.attempts + 1 < (job.maxAttempts || 3)) {
                // re-enqueue with incremented attempts and simple delay
                job.attempts = (job.attempts || 0) + 1;
                // small backoff
                setTimeout(() => enqueueMessage(job), 2000 * job.attempts);
                msg.status = 'queued';
              } else {
                msg.status = 'failed';
              }

              await msg.save();
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
