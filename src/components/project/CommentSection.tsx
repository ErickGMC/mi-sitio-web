"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { addComment, toggleCommentLike } from "@/services/db";
import { db } from "@/services/firebase";
import { Comment } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send } from "lucide-react";

interface CommentSectionProps {
  projectId: string;
}

export const CommentSection = ({ projectId }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, "comments"),
      where("projectId", "==", projectId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData: Comment[] = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() } as Comment);
      });
      // Ordenar localmente para evitar requerir un índice compuesto en Firestore
      commentsData.sort((a, b) => {
        const timeA = a.createdAt && typeof (a.createdAt as any).toMillis === 'function' 
          ? (a.createdAt as any).toMillis() 
          : new Date(a.createdAt as any || 0).getTime();
        const timeB = b.createdAt && typeof (b.createdAt as any).toMillis === 'function' 
          ? (b.createdAt as any).toMillis() 
          : new Date(b.createdAt as any || 0).getTime();
        return timeB - timeA;
      });
      setComments(commentsData);
    }, (error) => {
      console.error("Error fetching comments:", error);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(
        projectId,
        user.uid,
        user.displayName || "Usuario Anonimo",
        user.photoURL || "",
        newComment.trim()
      );
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: Timestamp | Date | number | string | null | undefined) => {
    if (!timestamp) return "";
    const date = timestamp && typeof (timestamp as any).toDate === 'function' ? (timestamp as any).toDate() : new Date(timestamp as any);
    return new Intl.DateTimeFormat('es-ES', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8 mt-12 border-t border-border/40 pt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">Comentarios ({comments.length})</h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-4 items-start relative">
          <Avatar className="h-10 w-10 mt-1 border border-border">
            <AvatarImage src={user.photoURL || ""} />
            <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-grow space-y-3">
            <Textarea
              placeholder="¿Qué te parece este proyecto?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none min-h-[100px] bg-muted/30 focus-visible:ring-primary/50"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newComment.trim() || isSubmitting} className="gap-2">
                <Send className="h-4 w-4" />
                <span>Comentar</span>
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-muted/20 border border-border/50 rounded-lg text-center">
          <p className="text-muted-foreground mb-4">Debes iniciar sesión para dejar un comentario.</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay comentarios aún. ¡Sé el primero!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} userUid={user?.uid} formatDate={formatDate} />
          ))
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment, userUid, formatDate }: { comment: Comment, userUid?: string, formatDate: (ts: Timestamp | Date | number | string | null | undefined) => string }) => {
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [optimisticDiff, setOptimisticDiff] = useState(0);

  const likesCount = Math.max(0, (comment.likesCount || 0) + optimisticDiff);

  useEffect(() => {
    // Reset optimistic diff when we receive new data from server that matches our expectation,
    // or just reset it when the source of truth changes and we aren't liking anymore.
    if (!isLiking) {
      setOptimisticDiff(0);
    }
  }, [comment.likesCount, isLiking]);

  const handleLike = async () => {
    if (!userUid || isLiking) return;

    setIsLiking(true);
    const newLikedState = !liked;
    setLiked(newLikedState);
    setOptimisticDiff(prev => newLikedState ? prev + 1 : prev - 1);

    const success = await toggleCommentLike(comment.id, userUid);
    if (!success) {
      setLiked(!newLikedState);
      setOptimisticDiff(0);
    }
    setIsLiking(false);
  };

  return (
    <div className="flex gap-4 group">
      <Avatar className="h-10 w-10 border border-border/40">
        <AvatarImage src={comment.userPhotoURL} />
        <AvatarFallback>{comment.userDisplayName?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{comment.userDisplayName}</span>
          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
        
        <div className="pt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-2 -ml-2 text-xs gap-1.5 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'}`}
            onClick={handleLike}
            disabled={!userUid || isLiking}
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${liked ? 'fill-current' : ''}`} />
            {likesCount > 0 && <span>{likesCount}</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};
