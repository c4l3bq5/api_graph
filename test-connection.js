import mongoose from 'mongoose';

const uri = "mongodb+srv://c4l:vhVdPsf7zWdIc753@first.85tckpd.mongodb.net/?appName=first";

console.log('Testing connection to:', uri);

async function testConnection() {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('  Connection successful!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('   Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
