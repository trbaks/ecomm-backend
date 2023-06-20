const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()

const URL = process.env.MONGO_URL
const dbName= 'e-commerce';

mongoose.set('strictQuery', true)
const connectToMongo = async () => {
    try {
        let db = await mongoose.connect(URL , {dbName: dbName})
        console.log(`Connected to database ${dbName} on cluster:`, db.connection.host);
    } catch (error) {
        console.log(error);
    }

    // const f = await User.find();
    // console.log(f);
}

module.exports = connectToMongo;