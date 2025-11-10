import { ApolloServer } from '@apollo/server';
import { jest } from '@jest/globals';

// Importar con variable para poder mockear
import * as RawDataBatchModule from '../src/models/RawDataBatch.js';
import * as UpperTrainModule from '../src/models/UpperTrain.js';
import * as UpperValModule from '../src/models/UpperVal.js';
import typeDefs from '../src/schema/typeDefs.js';
import resolvers from '../src/schema/resolvers.js';

describe('GraphQL Data Augmentation Tests', () => {
  let server;

  beforeAll(async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();
  });

  afterAll(async () => {
    await server?.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mutation: processDataAugmentation', () => {
    it('should process data augmentation for upper area', async () => {
      const mockImageData1 = {
        _id: 'img1',
        fileName: 'image1.jpg',
        image: Buffer.from('fake-image-1'),
        mask: Buffer.from('fake-mask-1'),
        annotations: 'annotation1',
        mimetype: 'image/jpeg',
        size: 1024
      };

      const mockImageData2 = {
        _id: 'img2',
        fileName: 'image2.jpg',
        image: Buffer.from('fake-image-2'),
        mask: Buffer.from('fake-mask-2'),
        annotations: 'annotation2',
        mimetype: 'image/jpeg',
        size: 2048
      };

      const mockBatchData = {
        _id: 'batch123',
        batch_id: '20231201_001',
        area: 'upper',
        totalImages: 2,
        status: 'uploaded',
        radImagesReferences: [
          { _id: mockImageData1._id, _doc: mockImageData1, ...mockImageData1 },
          { _id: mockImageData2._id, _doc: mockImageData2, ...mockImageData2 }
        ],
        uploadDate: new Date('2023-12-01T10:00:00.000Z')
      };

      const mockBatch = {
        _id: mockBatchData._id,
        _doc: mockBatchData,
        ...mockBatchData,
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock de findById con populate
      const populateMock = jest.fn().mockResolvedValue(mockBatch);
      jest.spyOn(RawDataBatchModule.default, 'findById').mockReturnValue({
        populate: populateMock
      });

      // Mock de save para los modelos de augmentación
      const mockSavedTrain = {
        _id: 'train123',
        save: jest.fn().mockResolvedValue(true)
      };
      const mockSavedVal = {
        _id: 'val123',
        save: jest.fn().mockResolvedValue(true)
      };
      
      jest.spyOn(UpperTrainModule.default.prototype, 'save').mockResolvedValue(mockSavedTrain);
      jest.spyOn(UpperValModule.default.prototype, 'save').mockResolvedValue(mockSavedVal);

      const mutation = `
        mutation ProcessDataAugmentation(
          $batchId: ID!
          $area: String!
          $augmentations: [String!]!
        ) {
          processDataAugmentation(
            batchId: $batchId
            area: $area
            augmentations: $augmentations
          ) {
            success
            message
            totalProcessed
            trainCount
            valCount
            batchId
          }
        }
      `;

      const response = await server.executeOperation({
        query: mutation,
        variables: {
          batchId: 'batch123',
          area: 'upper',
          augmentations: ['rotation', 'flip']
        }
      });

      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data.processDataAugmentation.success).toBe(true);
      expect(response.body.singleResult.data.processDataAugmentation.totalProcessed).toBe(2);
      expect(response.body.singleResult.data.processDataAugmentation.trainCount).toBeGreaterThan(0);
      // valCount puede ser 0 dependiendo de la lógica del 80/20
      expect(response.body.singleResult.data.processDataAugmentation.valCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors when batch not found', async () => {
      const populateMock = jest.fn().mockResolvedValue(null);
      jest.spyOn(RawDataBatchModule.default, 'findById').mockReturnValue({
        populate: populateMock
      });

      const mutation = `
        mutation ProcessDataAugmentation(
          $batchId: ID!
          $area: String!
          $augmentations: [String!]!
        ) {
          processDataAugmentation(
            batchId: $batchId
            area: $area
            augmentations: $augmentations
          ) {
            success
            message
          }
        }
      `;

      const response = await server.executeOperation({
        query: mutation,
        variables: {
          batchId: 'nonexistent',
          area: 'upper',
          augmentations: ['rotation']
        }
      });

      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data.processDataAugmentation.success).toBe(false);
      expect(response.body.singleResult.data.processDataAugmentation.message).toContain('Batch no encontrado');
    });
  });

  describe('Query: upperTrainImages', () => {
    it('should return upper train images', async () => {
      const mockData = {
        _id: 'train1',
        fileName: 'aug_train_1.jpg',
        augmentationType: 'rotation',
        batchId: 'batch123',
        split: 'train',
        image: Buffer.from('fake'),
        mask: Buffer.from('fake'),
        mimetype: 'image/jpeg',
        size: 1024,
        uploadDate: new Date('2023-12-01T10:00:00.000Z')
      };

      const mockImages = [{
        _id: mockData._id,
        _doc: mockData,
        ...mockData
      }];

      jest.spyOn(UpperTrainModule.default, 'find').mockResolvedValue(mockImages);

      const query = `
        query GetUpperTrainImages($batchId: String, $augmentationType: String) {
          upperTrainImages(batchId: $batchId, augmentationType: $augmentationType) {
            id
            fileName
            augmentationType
            batchId
            split
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { batchId: 'batch123' }
      });

      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data.upperTrainImages).toHaveLength(1);
      expect(response.body.singleResult.data.upperTrainImages[0].split).toBe('train');
    });
  });

  describe('Query: upperValImages', () => {
    it('should return upper validation images', async () => {
      const mockData = {
        _id: 'val1',
        fileName: 'aug_val_1.jpg',
        augmentationType: 'flip',
        batchId: 'batch123',
        split: 'val',
        image: Buffer.from('fake'),
        mask: Buffer.from('fake'),
        mimetype: 'image/jpeg',
        size: 1024,
        uploadDate: new Date('2023-12-01T10:00:00.000Z')
      };

      const mockImages = [{
        _id: mockData._id,
        _doc: mockData,
        ...mockData
      }];

      jest.spyOn(UpperValModule.default, 'find').mockResolvedValue(mockImages);

      const query = `
        query GetUpperValImages($batchId: String, $augmentationType: String) {
          upperValImages(batchId: $batchId, augmentationType: $augmentationType) {
            id
            fileName
            augmentationType
            batchId
            split
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { augmentationType: 'flip' }
      });

      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data.upperValImages).toHaveLength(1);
      expect(response.body.singleResult.data.upperValImages[0].split).toBe('val');
    });
  });
});