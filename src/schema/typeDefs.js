import { gql } from 'graphql-tag';

const typeDefs = gql`
  scalar Upload

  type Query {
    # Test
    hello: String
    
    # RawDataBatch
    rawDataBatches(area: String, status: String): [RawDataBatch]
    rawDataBatch(batchId: ID!): RawDataBatch
    
    # RadImages
    radImages(area: String): [RadImage]
    radImage(id: ID!): RadImage
    
    # UpperTrain
    upperTrainImages(batchId: String, augmentationType: String): [UpperTrainImage]
    upperTrainImage(id: ID!): UpperTrainImage
    
    # UpperVal
    upperValImages(batchId: String, augmentationType: String): [UpperValImage]
    upperValImage(id: ID!): UpperValImage
    
    # LowerTrain
    lowerTrainImages(batchId: String, augmentationType: String): [LowerTrainImage]
    lowerTrainImage(id: ID!): LowerTrainImage
    
    # LowerVal  
    lowerValImages(batchId: String, augmentationType: String): [LowerValImage]
    lowerValImage(id: ID!): LowerValImage
  }

  type Mutation {
    # Crear RawDataBatch (automático al subir primera imagen)
    createRawDataBatch(area: String!): RawDataBatch
    
    # Subir imagen a RadImages y actualizar RawDataBatch
    uploadRadImage(
        fileName: String!      
        imageBase64: String!  
        maskBase64: String!   
        mimetype: String!     
        area: String!
        annotations: String
      ): RadImageUploadResult
    
    # Procesar Data Augmentation y dividir 80/20
    processDataAugmentation(
      batchId: ID!
      area: String!
      augmentations: [String!]!  # ['rotation', 'flip', etc.]
    ): DataAugmentationResult
  }

  # TIPOS DE DATOS

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

  # RESULTADOS DE MUTATIONS

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