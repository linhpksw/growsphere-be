import mongoose from 'mongoose';
import app from './app';
const port = process.env.PORT || 5000;

require('dotenv').config();
const mongoUrl = process.env.DB_URL;
const mongooseOptions: any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Set a longer timeout (default is 30000)
};

async function mongodbConnect() {
    try {
        await mongoose.connect(mongoUrl!, mongooseOptions);
        console.log('Database connected!');
        app.get('/', (req, res) => {
            res.send('Server is running 🚀');
        });
        app.listen(port, () => {
            console.log(`App listening on port ${port} 🚀`);
        });
    } catch (e) {
        console.log('server err', e);
    }
}

mongodbConnect();
