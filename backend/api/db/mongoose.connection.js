import mongoose from 'mongoose';

// Track connection status
let isConnected = false; 

const connectMongo = async () => {
  const mongoURL = process.env.MONGO_URL;

  if (!mongoURL) {
    console.error(' MONGO_URL not found in environment variables');
    throw new Error('MONGO_URL missing');
  }

  if (isConnected || mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected, skipping re-connection');
    return;
  }

  try {
    await mongoose.connect(mongoURL);

    isConnected = true;
    console.log(` Connected to MongoDB (Mongoose)`);
  } catch (err) {
    console.error(' MongoDB connection failed:', err.message);
    process.exit(1); 
  }
};

export default connectMongo;