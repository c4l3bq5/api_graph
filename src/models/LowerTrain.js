import mongoose from 'mongoose';

const lowerTrainSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    image:{
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
    mimetype:{
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
        default: 'lower'
    },
    split: {
        type: String,
        enum: ['train'],
        required: true
    },
    augmentationType:{
        type: String,
        enum: ['rotation', 'flip', 'brightness', 'zoom', 'shift'],
        required: true
    },
    batchId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'raw_data',
        required: true
    },
    uploadDate:{
        type: Date,
        default: Date.now
    }
}, {collection: 'lower_train'}); 

export default mongoose.model('LowerTrain', lowerTrainSchema);