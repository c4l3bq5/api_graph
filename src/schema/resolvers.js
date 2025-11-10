import UpperTrain from '../models/UpperTrain.js';
import UpperVal from '../models/UpperVal.js';
import LowerTrain from '../models/LowerTrain.js';
import LowerVal from '../models/LowerVal.js';
import RadImage from '../models/RadImage.js';
import RawDataBatch from '../models/RawDataBatch.js';

const resolvers = {
  Query: {
    hello: () => '¡Hola! API funcionando correctamente',
    
    // UpperTrain
    upperTrainImages: async (_, { batchId, augmentationType }) => {
      const filter = {};
      if (batchId) filter.batchId = batchId;
      if (augmentationType) filter.augmentationType = augmentationType;

      const images = await UpperTrain.find(filter);
      return images.map(img => ({
        ...img._doc,
        id: img._id,
        image: img.image.toString('base64'),
        mask: img.mask.toString('base64'),
        uploadDate: img.uploadDate.toISOString()
      }));
    },

    upperTrainImage: async (_, { id }) => {
      const image = await UpperTrain.findById(id);
      if (!image) throw new Error('Imagen no encontrada');
      return {
        ...image._doc,
        id: image._id,
        image: image.image.toString('base64'),
        mask: image.mask.toString('base64'),
        uploadDate: image.uploadDate.toISOString()
      };
    },

    // UpperVal
    upperValImages: async (_, { batchId, augmentationType }) => {
      const filter = {};
      if (batchId) filter.batchId = batchId;
      if (augmentationType) filter.augmentationType = augmentationType;

      const images = await UpperVal.find(filter);
      return images.map(img => ({
        ...img._doc,
        id: img._id,
        image: img.image.toString('base64'),
        mask: img.mask.toString('base64'),
        uploadDate: img.uploadDate.toISOString()
      }));
    },

    upperValImage: async (_, { id }) => {
      const image = await UpperVal.findById(id);
      if (!image) throw new Error('Imagen no encontrada');
      return {
        ...image._doc,
        id: image._id,
        image: image.image.toString('base64'),
        mask: image.mask.toString('base64'),
        uploadDate: image.uploadDate.toISOString()
      };
    },

    // LowerTrain
    lowerTrainImages: async (_, { batchId, augmentationType }) => {
      const filter = {};
      if (batchId) filter.batchId = batchId;
      if (augmentationType) filter.augmentationType = augmentationType;

      const images = await LowerTrain.find(filter);
      return images.map(img => ({
        ...img._doc,
        id: img._id,
        image: img.image.toString('base64'),
        mask: img.mask.toString('base64'),
        uploadDate: img.uploadDate.toISOString()
      }));
    },

    lowerTrainImage: async (_, { id }) => {
      const image = await LowerTrain.findById(id);
      if (!image) throw new Error('Imagen no encontrada');
      return {
        ...image._doc,
        id: image._id,
        image: image.image.toString('base64'),
        mask: image.mask.toString('base64'),
        uploadDate: image.uploadDate.toISOString()
      };
    },

    // LowerVal
    lowerValImages: async (_, { batchId, augmentationType }) => {
      const filter = {};
      if (batchId) filter.batchId = batchId;
      if (augmentationType) filter.augmentationType = augmentationType;

      const images = await LowerVal.find(filter);
      return images.map(img => ({
        ...img._doc,
        id: img._id,
        image: img.image.toString('base64'),
        mask: img.mask.toString('base64'),
        uploadDate: img.uploadDate.toISOString()
      }));
    },

    lowerValImage: async (_, { id }) => {
      const image = await LowerVal.findById(id);
      if (!image) throw new Error('Imagen no encontrada');
      return {
        ...image._doc,
        id: image._id,
        image: image.image.toString('base64'),
        mask: image.mask.toString('base64'),
        uploadDate: image.uploadDate.toISOString()
      };
    },

    // RadImages
radImages: async (_, { area }) => {
  const filter = area ? { area } : {};
  const images = await RadImage.find(filter);
  return images.map(img => {
    const base64Image = img.image.toString('base64');
    const base64Mask = img.mask.toString('base64');
    
    return {
      ...img._doc,
      id: img._id,
      image: base64Image,
      imageUrl: `data:${img.mimetype};base64,${base64Image}`,
      mask: base64Mask,
      uploadDate: img.uploadDate.toISOString()
    };
  });
},

radImage: async (_, { id }) => {
  const image = await RadImage.findById(id);
  if (!image) throw new Error('Imagen no encontrada');

  const base64Image = image.image.toString('base64');  
  const base64Mask = image.mask.toString('base64');   

  return {
    ...image._doc,
    id: image._id,
    image: base64Image, 
    imageUrl: `data:${image.mimetype};base64,${base64Image}`, 
    mask: base64Mask,   
    uploadDate: image.uploadDate.toISOString()
  };
},

    // RawDataBatch
    rawDataBatches: async (_, { area, status }) => {
      const filter = {};
      if (area) filter.area = area;
      if (status) filter.status = status;
      
      const batches = await RawDataBatch.find(filter).populate('radImagesReferences');
      return batches.map(batch => ({
        ...batch._doc,
        id: batch._id,
        uploadDate: batch.uploadDate.toISOString()
      }));
    },

    rawDataBatch: async (_, { batchId }) => {
      const batch = await RawDataBatch.findById(batchId).populate('radImagesReferences');
      if (!batch) throw new Error('Batch no encontrado');
      return {
        ...batch._doc,
        id: batch._id,
        uploadDate: batch.uploadDate.toISOString()
      };
    }
  },

  Mutation: {
    // Crear RawDataBatch automáticamente
    createRawDataBatch: async (_, { area }) => {
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Encontrar el último batch del día
        const lastBatch = await RawDataBatch.findOne({
          batch_id: new RegExp(`^${today}_`)
        }).sort({ batch_id: -1 });
        
        let sequence = '001';
        if (lastBatch) {
          const lastSequence = parseInt(lastBatch.batch_id.split('_')[1]);
          sequence = String(lastSequence + 1).padStart(3, '0');
        }
        
        const batch_id = `${today}_${sequence}`;
        
        const newBatch = new RawDataBatch({
          batch_id,
          area,
          totalImages: 0,
          status: 'uploaded',
          radImagesReferences: []
        });
        
        const savedBatch = await newBatch.save();
        
        return {
          ...savedBatch._doc,
          id: savedBatch._id,
          uploadDate: savedBatch.uploadDate.toISOString()
        };
        
      } catch (error) {
        console.error('Error creando RawDataBatch:', error);
        throw new Error('No se pudo crear el batch');
      }
    },

    // Subir imagen a RadImages y actualizar RawDataBatch
    uploadRadImage: async (_, { fileName, imageBase64, maskBase64, mimetype, area, annotations }) => {
  try {
    // 1. Crear o obtener batch del día
    const today = new Date().toISOString().split('T')[0];
    let batch = await RawDataBatch.findOne({
      batch_id: new RegExp(`^${today}_`),
      area,
      status: 'uploaded'
    });
    
    if (!batch) {
      batch = await resolvers.Mutation.createRawDataBatch(null, { area });
    }
    
    // 2. Convertir Base64 a Buffer (¡FÁCIL!)
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const maskBuffer = Buffer.from(maskBase64, 'base64');
    
    // 3. Crear RadImage
    const newRadImage = new RadImage({
      fileName: fileName,
      image: imageBuffer,
      mask: maskBuffer,
      annotations,
      mimetype,
      size: imageBuffer.length,
      area,
      uploadDate: new Date()
    });
    
    const savedRadImage = await newRadImage.save();
    
    // 4. Actualizar RawDataBatch
    batch.radImagesReferences.push(savedRadImage._id);
    batch.totalImages += 1;
    await batch.save();
    
    // 5. Devolver resultado
    return {
      success: true,
      message: 'Imagen subida correctamente',
      radImage: {
        ...savedRadImage._doc,
        id: savedRadImage._id,
        image: imageBase64, // Devolver el mismo Base64
        mask: maskBase64,   // Devolver el mismo Base64
        uploadDate: savedRadImage.uploadDate.toISOString()
      },
      rawDataBatch: {
        ...batch._doc,
        id: batch._id,
        uploadDate: batch.uploadDate.toISOString()
      }
    };
    
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    return {
      success: false,
      message: 'Error subiendo imagen: ' + error.message,
      radImage: null,
      rawDataBatch: null
    };
  }
},

    // Procesar Data Augmentation
    processDataAugmentation: async (_, { batchId, area, augmentations }) => {
      try {
        // 1. Obtener batch y sus imágenes
        const batch = await RawDataBatch.findById(batchId).populate('radImagesReferences');
        if (!batch) throw new Error('Batch no encontrado');
        
        let trainCount = 0;
        let valCount = 0;
        const totalProcessed = batch.radImagesReferences.length;
        
        // 2. Determinar modelos destino
        const TrainModel = area === 'upper' ? UpperTrain : LowerTrain;
        const ValModel = area === 'upper' ? UpperVal : LowerVal;
        
        // 3. Procesar cada imagen del batch
        for (const radImage of batch.radImagesReferences) {
          // Aplicar cada tipo de augmentación
          for (let i = 0; i < augmentations.length; i++) {
            const augmentationType = augmentations[i];
            
            // Determinar si va a train (80%) o val (20%)
            const isTrain = i < augmentations.length * 0.8;
            const Model = isTrain ? TrainModel : ValModel;
            
            // Crear imagen aumentada
            const augmentedImage = new Model({
              fileName: `aug_${radImage.fileName}_${augmentationType}`,
              image: radImage.image, // Misma imagen por ahora
              mask: radImage.mask,   // Misma máscara por ahora
              annotations: radImage.annotations,
              mimetype: radImage.mimetype,
              size: radImage.size,
              area,
              split: isTrain ? 'train' : 'val',
              augmentationType,
              batchId: batchId,
              uploadDate: new Date()
            });
            
            await augmentedImage.save();
            
            if (isTrain) trainCount++;
            else valCount++;
          }
        }
        
        // 4. Actualizar estado del batch
        batch.status = 'completed';
        await batch.save();
        
        return {
          success: true,
          message: `Data Augmentation completada. ${totalProcessed} imágenes procesadas`,
          totalProcessed,
          trainCount,
          valCount,
          batchId
        };
        
      } catch (error) {
        console.error('Error en Data Augmentation:', error);
        return {
          success: false,
          message: 'Error en Data Augmentation: ' + error.message,
          totalProcessed: 0,
          trainCount: 0,
          valCount: 0,
          batchId
        };
      }
    }
  }
};

export default resolvers;