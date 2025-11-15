const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./app');
const connectDatabase = require('./config/database');

connectDatabase();

require('./config/cloudinary');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server started on PORT: ${PORT}`);
});
