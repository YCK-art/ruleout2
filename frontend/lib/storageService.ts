import { storage } from "./firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

/**
 * Upload an image to Firebase Storage
 * @param file - The image file to upload
 * @param path - The storage path (e.g., 'blog-images/my-image.jpg')
 * @returns The download URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Delete an image from Firebase Storage
 * @param path - The storage path of the image to delete
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

/**
 * Upload a blog post image
 * @param file - The image file
 * @param blogSlug - The blog post slug
 * @returns The download URL
 */
export async function uploadBlogImage(
  file: File,
  blogSlug: string
): Promise<string> {
  const timestamp = Date.now();
  const extension = file.name.split(".").pop();
  const path = `blog-images/${blogSlug}-${timestamp}.${extension}`;
  return uploadImage(file, path);
}

/**
 * Upload a blog post thumbnail
 * @param file - The image file
 * @param blogSlug - The blog post slug
 * @returns The download URL
 */
export async function uploadBlogThumbnail(
  file: File,
  blogSlug: string
): Promise<string> {
  const timestamp = Date.now();
  const extension = file.name.split(".").pop();
  const path = `blog-thumbnails/${blogSlug}-${timestamp}.${extension}`;
  return uploadImage(file, path);
}
