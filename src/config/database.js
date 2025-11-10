import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
            console.log('Conectado a Mongo DB');
    }catch{
        console.error('Error de conexión', error);
        process.exit(1);
    }
};

export default connectDB;