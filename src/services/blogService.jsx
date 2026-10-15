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

function normalizeTitle(title) {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

function validateBlog(blogData) {
  const title = typeof blogData.title === "string" ? blogData.title.trim() : "";

  const content =
    typeof blogData.content === "string" ? blogData.content.trim() : "";

  if (!title) {
    throw new Error("Title is required.");
  }
  if (!/^[a-zA-Z0-9 ]+$/.test(title)) {
    throw new Error("Title can contain only letters, numbers, and spaces.");
  }
  if (title.length < 3) {
    throw new Error("Title must contain at least 3 characters.");
  }

  if (title.length > 120) {
    throw new Error("Title cannot exceed 120 characters.");
  }

  if (!content) {
    throw new Error("Content is required.");
  }

  if (content.length < 10) {
    throw new Error("Content must contain at least 10 characters.");
  }

  if (content.length > 10000) {
    throw new Error("Content cannot exceed 10,000 characters.");
  }

  return {
    title: title.replace(/\s+/g, " "),
    content,
  };
}

// Check if the same user already has a blog with this title.
async function checkDuplicateTitle(title, authorId, excludeId = null) {
  if (!authorId) {
    throw new Error("Please log in before saving a blog.");
  }

  const q = query(blogsRef, where("authorId", "==", authorId));

  const snapshot = await getDocs(q);
  const normalizedTitle = normalizeTitle(title);

  return snapshot.docs.some((blogDoc) => {
    // Exclude the current blog when editing it.
    if (blogDoc.id === excludeId) {
      return false;
    }

    const existingTitle = blogDoc.data().title || "";

    return normalizeTitle(existingTitle) === normalizedTitle;
  });
}

// CREATE: Validate and create a new blog.
export async function createBlog(blogData) {
  const { title, content } = validateBlog(blogData);

  const duplicate = await checkDuplicateTitle(title, blogData.authorId);

  if (duplicate) {
    throw new Error(
      "A blog with this title already exists. Please choose a different title.",
    );
  }

  return await addDoc(blogsRef, {
    ...blogData,
    title,
    content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// READ: Get all blogs belonging to a user.
export async function getBlogs(userId) {
  const q = query(
    blogsRef,
    where("authorId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

// READ: Get one blog.
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

// UPDATE: Validate and update the existing blog.
export async function updateBlog(id, blogData) {
  const { title, content } = validateBlog(blogData);

  const blogRef = doc(db, "blogs", id);
  const snapshot = await getDoc(blogRef);

  if (!snapshot.exists()) {
    throw new Error("This blog no longer exists.");
  }

  const existingBlog = snapshot.data();

  if (!existingBlog.authorId) {
    throw new Error("Unable to verify the blog owner.");
  }

  const duplicate = await checkDuplicateTitle(title, existingBlog.authorId, id);

  if (duplicate) {
    throw new Error(
      "A blog with this title already exists. Please choose a different title.",
    );
  }

  // updateDoc modifies the existing document, not a new one.
  return await updateDoc(blogRef, {
    title,
    content,
    updatedAt: serverTimestamp(),
  });
}

// DELETE: Remove a blog.
export async function deleteBlog(id) {
  return await deleteDoc(doc(db, "blogs", id));
}
