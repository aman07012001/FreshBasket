const mongoose = require('mongoose');

function parseMongoDBName(uri) {
  try {
    const match = uri && uri.match(/\/([^/?]+)(\?|$)/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

async function connectTestDB(uri) {
  const effectiveUri = uri || process.env.TEST_MONGO_URL || process.env.MONGO_URL;

  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Refusing to run tests: NODE_ENV must be "test"');
  }

  const dbName = parseMongoDBName(effectiveUri);
  if (!dbName || !dbName.endsWith('_test')) {
    throw new Error(
      `Refusing to use DB "${dbName}". Test DB name must end with "_test". ` +
        'Please set TEST_MONGO_URL or MONGO_URL to a dedicated test DB.',
    );
  }

  await mongoose.connect(effectiveUri);
  return mongoose.connection;
}

async function safeDropDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Refusing to drop database outside test environment');
  }

  const dbName = mongoose.connection && mongoose.connection.name;
  if (!dbName || !dbName.endsWith('_test')) {
    throw new Error(`Refusing to drop DB "${dbName}" — name must end with "_test"`);
  }

  await mongoose.connection.dropDatabase();
}

module.exports = {
  connectTestDB,
  safeDropDatabase,
};
