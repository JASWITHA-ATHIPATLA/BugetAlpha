const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI || '';
  if (uri && uri.includes('.mongodb.net/?')) {
    uri = uri.replace('.mongodb.net/?', '.mongodb.net/expense_tracker?');
  } else if (uri && uri.endsWith('.mongodb.net')) {
    uri = uri + '/expense_tracker';
  }
  console.log('MONGO_URI Loaded:', uri.replace(/:(.*?)@/, ':****@'));
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected to [${conn.connection.name}] database on ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
