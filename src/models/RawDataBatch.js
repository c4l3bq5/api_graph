import mongoose from 'mongoose';

const rawDataBatchSchema = new mongoose.Schema({
    batch_id: {
        type: String,
        required: true,
        unique: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    totalImages: {
        type: Number,
        default: 0
    },
    area: {
        type: String,
        enum: ['upper', 'lower'],
        required: true
    },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'completed'],
        default: 'uploaded'
    },
    radImagesReferences: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RadImage'
    }]
}, { collection: 'raw_data' });

export default mongoose.model('RawDataBatch', rawDataBatchSchema);