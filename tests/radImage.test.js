import { ApolloServer } from '@apollo/server';
import { jest } from '@jest/globals';

// Importar con variable para poder mockear
import * as RadImageModule from '../src/models/RadImage.js';
import * as RawDataBatchModule from '../src/models/RawDataBatch.js';
import typeDefs from '../src/schema/typeDefs.js';
import resolvers from '../src/schema/resolvers.js';

describe('GraphQL RadImage Tests', () => {
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

  describe('Query: radImages', () => {
    it('should return list of rad images', async () => {
      const mockData = {
        _id: '507f1f77bcf86cd799439011',
        fileName: 'test1.jpg',
        image: Buffer.from('fake-image-data'),
        mask: Buffer.from('fake-mask-data'),
        annotations: 'test annotations',
        mimetype: 'image/jpeg',
        size: 1024,
        area: 'upper',
        uploadDate: new Date('2023-12-01T10:00:00.000Z')
      };

      const mockImages = [{
        _id: mockData._id,
        _doc: mockData,
        ...mockData
      }];

      jest.spyOn(RadImageModule.default, 'find').mockResolvedValue(mockImages);

      const query = `
        query GetRadImages($area: String) {
          radImages(area: $area) {
            id
            fileName
            mimetype
            area
            uploadDate
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { area: 'upper' }
      });

      expect(response.body.kind).toBe('single');
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data.radImages).toBeDefined();
      expect(Array.isArray(response.body.singleResult.data.radImages)).toBe(true);
    });

    it('should filter images by area', async () => {
      const mockData = {
        _id: '507f1f77bcf86cd799439011',
        fileName: 'upper1.jpg',
        area: 'upper',
        image: Buffer.from('fake'),
        mask: Buffer.from('fake'),
        annotations: 'test annotations',
        mimetype: 'image/jpeg',
        size: 1024,
        uploadDate: new Date('2023-12-01T10:00:00.000Z')
      };

      const mockImages = [{
        _id: mockData._id,
        _doc: mockData,
        ...mockData
      }];

      jest.spyOn(RadImageModule.default, 'find').mockResolvedValue(mockImages);

      const query = `
        query GetRadImages($area: String) {
          radImages(area: $area) {
            id
            fileName
            area
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { area: 'upper' }
      });

      expect(RadImageModule.default.find).toHaveBeenCalledWith({ area: 'upper' });
      expect(response.body.singleResult.data.radImages).toHaveLength(1);
    });
  });

  describe('Query: radImage', () => {
    it('should return single rad image by id', async () => {
      const mockData = {
        _id: '507f1f77bcf86cd799439011',
        fileName: 'test.jpg',
        image: Buffer.from('fake-image'),
        mask: Buffer.from('fake-mask'),
        annotations: 'test annotations',
        mimetype: 'image/jpeg',
        size: 2048,
        area: 'upper',
        uploadDate: new Date('2023-12-01T10:00:00.000Z')
      };

      const mockImage = {
        _id: mockData._id,
        _doc: mockData,
        ...mockData
      };

      jest.spyOn(RadImageModule.default, 'findById').mockResolvedValue(mockImage);

      const query = `
        query GetRadImage($id: ID!) {
          radImage(id: $id) {
            id
            fileName
            mimetype
            area
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: '507f1f77bcf86cd799439011' }
      });

      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data.radImage.fileName).toBe('test.jpg');
    });

    it('should return error for non-existent image', async () => {
      jest.spyOn(RadImageModule.default, 'findById').mockResolvedValue(null);

      const query = `
        query GetRadImage($id: ID!) {
          radImage(id: $id) {
            id
            fileName
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: 'nonexistent' }
      });

      expect(response.body.singleResult.errors).toBeDefined();
      expect(response.body.singleResult.errors[0].message).toBe('Imagen no encontrada');
    });
  });

  describe('Mutation: uploadRadImage', () => {
    it('should upload rad image successfully', async () => {
      const mockBatchData = {
        _id: 'batch123',
        batch_id: '20231201_001',
        area: 'upper',
        totalImages: 0,
        status: 'uploaded',
        radImagesReferences: [],
        uploadDate: new Date('2023-12-01T10:00:00.000Z')
      };

      const mockBatch = {
        _id: mockBatchData._id,
        _doc: mockBatchData,
        ...mockBatchData,
        save: jest.fn().mockResolvedValue(true)
      };

      const mockSavedImageData = {
        _id: 'image123',
        fileName: 'test.jpg',
        area: 'upper',
        uploadDate: new Date('2023-12-01T10:00:00.000Z'),
        image: Buffer.from('fake'),
        mask: Buffer.from('fake'),
        annotations: '',
        mimetype: 'image/jpeg',
        size: 1024
      };

      const mockSavedImage = {
        _id: mockSavedImageData._id,
        _doc: mockSavedImageData,
        ...mockSavedImageData
      };

      jest.spyOn(RawDataBatchModule.default, 'findOne').mockResolvedValue(mockBatch);
      jest.spyOn(RadImageModule.default.prototype, 'save').mockResolvedValue(mockSavedImage);

      const mutation = `
        mutation UploadRadImage(
          $fileName: String!
          $imageBase64: String!
          $maskBase64: String!
          $mimetype: String!
          $area: String!
        ) {
          uploadRadImage(
            fileName: $fileName
            imageBase64: $imageBase64
            maskBase64: $maskBase64
            mimetype: $mimetype
            area: $area
          ) {
            success
            message
            radImage {
              id
              fileName
            }
            rawDataBatch {
              id
              batch_id
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query: mutation,
        variables: {
          fileName: 'test.jpg',
          imageBase64: 'base64imagedata',
          maskBase64: 'base64maskdata',
          mimetype: 'image/jpeg',
          area: 'upper'
        }
      });

      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data.uploadRadImage.success).toBe(true);
      expect(response.body.singleResult.data.uploadRadImage.message).toBe('Imagen subida correctamente');
    });
  });
});