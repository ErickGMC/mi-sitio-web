import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "@/types";

// User Functions
export const createUserProfile = async (user: UserProfile) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp()
    });
  }
};

// Project Like Function (Atomic Transaction)
export const toggleProjectLike = async (projectId: string, userId: string) => {
  const likeId = `${userId}_${projectId}`;
  const likeRef = doc(db, "project_likes", likeId);
  const projectRef = doc(db, "projects", projectId);

  try {
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      if (!projectDoc.exists()) {
        throw new Error("Project does not exist!");
      }

      const likeDoc = await transaction.get(likeRef);
      const currentLikes = projectDoc.data().likesCount || 0;

      if (likeDoc.exists()) {
        // Unlike
        transaction.delete(likeRef);
        transaction.update(projectRef, { likesCount: currentLikes - 1 });
      } else {
        // Like
        transaction.set(likeRef, {
          id: likeId,
          userId,
          projectId,
          createdAt: serverTimestamp()
        });
        transaction.update(projectRef, { likesCount: currentLikes + 1 });
      }
    });
    return true;
  } catch (error) {
    console.error("Transaction failed: ", error);
    return false;
  }
};

// Comment Like Function (Atomic Transaction)
export const toggleCommentLike = async (commentId: string, userId: string) => {
  const likeId = `${userId}_${commentId}`;
  const likeRef = doc(db, "comment_likes", likeId);
  const commentRef = doc(db, "comments", commentId);

  try {
    await runTransaction(db, async (transaction) => {
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists()) {
        throw new Error("Comment does not exist!");
      }

      const likeDoc = await transaction.get(likeRef);
      const currentLikes = commentDoc.data().likesCount || 0;

      if (likeDoc.exists()) {
        // Unlike
        transaction.delete(likeRef);
        transaction.update(commentRef, { likesCount: currentLikes - 1 });
      } else {
        // Like
        transaction.set(likeRef, {
          id: likeId,
          userId,
          commentId,
          createdAt: serverTimestamp()
        });
        transaction.update(commentRef, { likesCount: currentLikes + 1 });
      }
    });
    return true;
  } catch (error) {
    console.error("Transaction failed: ", error);
    return false;
  }
};

// Add Comment Function (Atomic Transaction for commentsCount)
export const addComment = async (
  projectId: string, 
  userId: string, 
  userDisplayName: string, 
  userPhotoURL: string, 
  text: string
) => {
  const commentsRef = collection(db, "comments");
  const newCommentRef = doc(commentsRef);
  const projectRef = doc(db, "projects", projectId);

  try {
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      if (!projectDoc.exists()) {
        throw new Error("Project does not exist!");
      }

      const currentCommentsCount = projectDoc.data().commentsCount || 0;

      // Add comment
      transaction.set(newCommentRef, {
        id: newCommentRef.id,
        projectId,
        userId,
        userDisplayName,
        userPhotoURL,
        text,
        likesCount: 0,
        createdAt: serverTimestamp()
      });

      // Increment comments count
      transaction.update(projectRef, { commentsCount: currentCommentsCount + 1 });
    });
    return newCommentRef.id;
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
};

// Check if user liked a project
export const checkUserProjectLike = async (projectId: string, userId: string) => {
  if (!userId) return false;
  const likeId = `${userId}_${projectId}`;
  const likeRef = doc(db, "project_likes", likeId);
  const snap = await getDoc(likeRef);
  return snap.exists();
};
