
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const blogsRef = collection(db, "blogs");

// CREATE: Add a new blog
export async function createBlog(blogData) {
  return await addDoc(blogsRef, {
    ...blogData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// READ: Get all blogs
export async function getBlogs(userId) {
  const q = query(
    blogsRef,
    where("authorId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}// READ: Get one blog
export async function getBlogById(id) {
  const snapshot = await getDoc(doc(db, "blogs", id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// UPDATE: Edit an existing blog
export async function updateBlog(id, blogData) {
  return await updateDoc(doc(db, "blogs", id), {
    ...blogData,
    updatedAt: serverTimestamp(),
  });
}

// DELETE: Remove a blog
export async function deleteBlog(id) {
  return await deleteDoc(doc(db, "blogs", id));
}
