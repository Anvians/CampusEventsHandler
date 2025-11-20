import mongoose from 'mongoose';

let isConnected = false; 

const connectMongo = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('MONGO_URI not found in environment variables');
    throw new Error('MONGO_URI missing');
  }

  if (isConnected) {
    console.log(' MongoDB already connected, skipping re-connection');
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log(`Connected to MongoDB (Mongoose)`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
};

export default connectMongo;
