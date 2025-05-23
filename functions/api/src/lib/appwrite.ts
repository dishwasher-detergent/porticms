import { Client, Databases, ImageFormat, Models, Storage } from 'node-appwrite';
import { ImagePreview } from '../types/types.js';
import { arrayBufferToBase64 } from './utils.js';

export const ENDPOINT = process.env.APPWRITE_FUNCTION_API_ENDPOINT as string;
export const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID as string;
export const API_KEY = process.env.API_KEY as string;
export const DATABASE_ID = process.env.DATABASE_ID as string;

// Collections
export const EXPERIENCE_COLLECTION_ID = process.env
  .EXPERIENCE_COLLECTION_ID as string;
export const ORGANIZATION_COLLECTION_ID = process.env
  .ORGANIZATION_COLLECTION_ID as string;
export const PROJECTS_COLLECTION_ID = process.env
  .PROJECTS_COLLECTION_ID as string;
export const EDUCATION_COLLECTION_ID = process.env
  .EDUCATION_COLLECTION_ID as string;

// Buckets
export const PROJECTS_BUCKET_ID = process.env.PROJECTS_BUCKET_ID as string;

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const database = new Databases(client);
const storage = new Storage(client);

export const database_service = {
  /**
   * Retrieves information from the database based on the provided document ID and collection ID.
   *
   * @template {T} - The type of the document to retrieve.
   * @param {string} collectionId - The ID of the collection where the document is stored.
   * @param {string} id - The ID of the document to retrieve.
   * @returns A promise that resolves to the retrieved document.
   */
  async get<T extends Models.Document>(collectionId: string, id: string) {
    const response = await database.getDocument<T>(
      DATABASE_ID,
      collectionId,
      id
    );

    return response;
  },

  /**
   * Retrieves a list of documents from a specific collection.
   *
   * @template {T} - The type of the documents to retrieve.
   * @param {string} collectionId - The ID of the collection to retrieve documents from.
   * @returns A promise that resolves to an array of documents of type T.
   */
  async list<T extends Models.Document>(
    collectionId: string,
    queries: string[] = []
  ) {
    console.log(client.config);

    const response = await database.listDocuments<T>(
      DATABASE_ID,
      collectionId,
      queries
    );

    return response;
  },
};

export const storage_service = {
  /**
   * Retrieves a file from the specified storage bucket.
   *
   * @param {string} bucketId - The ID of the bucket where the file is stored.
   * @param {string} id - The ID of the file to retrieve.
   * @returns A promise that resolves to the retrieved file.
   */
  async get(bucketId: string, id: string) {
    const response = await storage.getFile(bucketId, id);

    return response;
  },

  /**
   * Retrieves a list of files from the specified storage bucket.
   *
   * @param {string} bucketId - The ID of the bucket to retrieve files from.
   * @returns A promise that resolves to an array of files.
   */
  async list(bucketId: string) {
    const response = await storage.listFiles(bucketId);

    return response;
  },

  async getFilePreview(bucketId: string, id: string, options?: ImagePreview) {
    const defaultOptions = {
      width: undefined,
      height: undefined,
      gravity: undefined,
      quality: undefined,
      borderWidth: undefined,
      borderColor: undefined,
      borderRadius: undefined,
      opacity: undefined,
      rotation: undefined,
      background: undefined,
      output: ImageFormat.Png,
    };

    const combinedOptions = {
      ...defaultOptions,
      ...options,
    };

    try {
      const response = await storage.getFilePreview(
        bucketId,
        id,
        combinedOptions.width,
        combinedOptions.height,
        combinedOptions.gravity,
        combinedOptions.quality,
        combinedOptions.borderWidth,
        combinedOptions.borderColor,
        combinedOptions.borderRadius,
        combinedOptions.opacity,
        combinedOptions.rotation,
        combinedOptions.background,
        combinedOptions.output
      );

      return arrayBufferToBase64(response);
    } catch (err) {
      return null;
    }
  },
};
