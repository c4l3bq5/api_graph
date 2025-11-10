import mongoose from 'mongoose';

const radImageSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    image: {
        type: Buffer,
        required: true
    },
    mask: {
        type: Buffer,
        required: true
    },
    annotations: {
        type: String,
        default: null
    },
    mimetype: {
        type: String,
        required: true,
        enum: ['image/jpeg', 'image/png', 'image/jpg']
    },
    size: {
        type: Number,
        required: true
    },
    area: {
        type: String,
        enum: ['upper', 'lower'],
        required: true
    },
    clinic_history_id: {
        type: String,
        default:null,
        index: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
    
}, { collection: 'rad_images' });

export default mongoose.model('RadImage', radImageSchema);