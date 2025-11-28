import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  author: string;
  authorEmail?: string;
  date: Date;
  category: string;
  isFeatured: boolean;
  imageUrl?: string;
  videoUrl?: string;
  tableOfContents?: {
    id: string;
    title: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = "blogPosts";

// Convert Firestore document to BlogPost
const docToPost = (doc: DocumentData): BlogPost => {
  const data = doc.data();
  return {
    id: doc.id,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    author: data.author,
    authorEmail: data.authorEmail,
    date: data.date?.toDate() || new Date(),
    category: data.category,
    isFeatured: data.isFeatured || false,
    imageUrl: data.imageUrl,
    videoUrl: data.videoUrl,
    tableOfContents: data.tableOfContents || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Get all blog posts
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToPost);
  } catch (error) {
    console.error("Error getting blog posts:", error);
    return [];
  }
};

// Get featured blog post
export const getFeaturedPost = async (): Promise<BlogPost | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("isFeatured", "==", true)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    // Sort by date client-side
    const posts = querySnapshot.docs.map(docToPost);
    posts.sort((a, b) => b.date.getTime() - a.date.getTime());
    return posts[0];
  } catch (error) {
    console.error("Error getting featured post:", error);
    return null;
  }
};

// Get blog post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("slug", "==", slug)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return docToPost(querySnapshot.docs[0]);
  } catch (error) {
    console.error("Error getting blog post by slug:", error);
    return null;
  }
};

// Get posts by category
export const getPostsByCategory = async (category: string): Promise<BlogPost[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);

    // Sort by date client-side
    const posts = querySnapshot.docs.map(docToPost);
    posts.sort((a, b) => b.date.getTime() - a.date.getTime());
    return posts;
  } catch (error) {
    console.error("Error getting posts by category:", error);
    return [];
  }
};

// Create a new blog post
export const createBlogPost = async (
  post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
): Promise<string | null> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...post,
      date: Timestamp.fromDate(post.date),
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating blog post:", error);
    return null;
  }
};

// Update a blog post
export const updateBlogPost = async (
  id: string,
  updates: Partial<BlogPost>
): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating blog post:", error);
    return false;
  }
};

// Delete a blog post
export const deleteBlogPost = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return false;
  }
};
