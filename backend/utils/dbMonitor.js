
const mongoose = require('mongoose');

const dbMonitor = {

  init() {
    const connection = mongoose.connection;

    connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.set('debug', (collectionName, method, query, doc) => {
      console.log(`🗄️  MongoDB Query: ${collectionName}.${method}`, {
        query: JSON.stringify(query),
        doc: doc ? JSON.stringify(doc) : undefined
      });
    });
  },

  async testConnection() {
    try {
      const admin = mongoose.connection.db.admin();
      const result = await admin.ping();
      console.log('✅ MongoDB ping successful');
      return true;
    } catch (error) {
      console.error('❌ MongoDB ping failed:', error);
      return false;
    }
  },

  getConnectionStats() {
    const connection = mongoose.connection;
    return {
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name
    };
  }
};

module.exports = dbMonitor;