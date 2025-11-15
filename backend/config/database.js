const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB connected to HOST: ${con.connection.host}`);
    } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);
        process.exit(1); // optional: exit process if connection fails
    }
};

module.exports = connectDatabase;
