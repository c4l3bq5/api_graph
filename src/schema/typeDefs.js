import { gql } from 'graphql-tag';

const typeDefs = gql`
  scalar Upload

  type Query {
    hello: String
    
    rawDataBatches(area: String, status: String): [RawDataBatch]
    rawDataBatch(batchId: ID!): RawDataBatch
    
    radImages(area: String, clinicHistoryId: String): [RadImage]
    radImage(id: ID!): RadImage
    radImagesByClinicHistory(clinicHistoryId: String!): [RadImage]
    
    # NUEVOS QUERIES AGREGADOS
    recentRadImages(limit: Int): [RadImage]
    allRadImages: [RadImage]
    
    upperTrainImages(batchId: String, augmentationType: String): [UpperTrainImage]
    upperTrainImage(id: ID!): UpperTrainImage
    
    upperValImages(batchId: String, augmentationType: String): [UpperValImage]
    upperValImage(id: ID!): UpperValImage
    
    lowerTrainImages(batchId: String, augmentationType: String): [LowerTrainImage]
    lowerTrainImage(id: ID!): LowerTrainImage
     
    lowerValImages(batchId: String, augmentationType: String): [LowerValImage]
    lowerValImage(id: ID!): LowerValImage
  }

  type Mutation {
    createRawDataBatch(area: String!): RawDataBatch
    
    uploadRadImage(
        fileName: String!      
        imageBase64: String!  
        maskBase64: String!   
        mimetype: String!     
        area: String!
        annotations: String
        clinicHistoryId: String
      ): RadImageUploadResult
    
    linkImageToClinicHistory(
      imageId: ID!
      clinicHistoryId: String!
    ): RadImage
    
    processDataAugmentation(
      batchId: ID!
      area: String!
      augmentations: [String!]!
    ): DataAugmentationResult
  }

  type RawDataBatch {
    id: ID!
    batch_id: String!
    uploadDate: String!
    totalImages: Int!
    area: String!
    status: String!
    radImagesReferences: [ID!]!
  }

  type RadImage {
    id: ID!
    fileName: String!
    image: String!
    imageUrl: String!
    mask: String!
    annotations: String
    mimetype: String!
    size: Int!
    area: String!
    clinicHistoryId: String
    uploadDate: String!
  }

  type UpperTrainImage {
    id: ID!
    fileName: String!
    image: String!
    mask: String!
    annotations: String
    mimetype: String!
    size: Int!
    area: String!
    split: String!
    augmentationType: String!
    batchId: ID!
    uploadDate: String!
  }

  type UpperValImage {
    id: ID!
    fileName: String!
    image: String!
    mask: String!
    annotations: String
    mimetype: String!
    size: Int!
    area: String!
    split: String!
    augmentationType: String!
    batchId: ID!
    uploadDate: String!
  }

  type LowerTrainImage {
    id: ID!
    fileName: String!
    image: String!
    mask: String!
    annotations: String
    mimetype: String!
    size: Int!
    area: String!
    split: String!
    augmentationType: String!
    batchId: ID!
    uploadDate: String!
  }

  type LowerValImage {
    id: ID!
    fileName: String!
    image: String!
    mask: String!
    annotations: String
    mimetype: String!
    size: Int!
    area: String!
    split: String!
    augmentationType: String!
    batchId: ID!
    uploadDate: String!
  }

  type RadImageUploadResult {
    success: Boolean!
    message: String!
    radImage: RadImage
    rawDataBatch: RawDataBatch
  }

  type DataAugmentationResult {
    success: Boolean!
    message: String!
    totalProcessed: Int!
    trainCount: Int!
    valCount: Int!
    batchId: ID!
  }
`;

export default typeDefs;