const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_crm';
  await mongoose.connect(uri, { dbName: 'whatsapp_crm' });
  console.log('Connected to MongoDB');
}

module.exports = { connect, mongoose };
