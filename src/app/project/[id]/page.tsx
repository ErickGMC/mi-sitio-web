"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { toggleProjectLike, checkUserProjectLike } from "@/services/db";
import { db } from "@/services/firebase";
import { Project } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { CommentSection } from "@/components/project/CommentSection";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, GitBranch, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Array.isArray(id) ? id[0] : id;
  
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const projectRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(projectRef, (docSnap) => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() } as Project);
      } else {
        setProject(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (user && projectId) {
        const isLiked = await checkUserProjectLike(projectId, user.uid);
        setLiked(isLiked);
      } else {
        setLiked(false);
      }
    };
    fetchLikeStatus();
  }, [projectId, user]);

  const handleLike = async () => {
    if (!user || !project || isLiking) return;

    setIsLiking(true);
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    // Optimistic UI update locally on the current state object (Firestore listener will override eventually)
    setProject(prev => prev ? { ...prev, likesCount: newLikedState ? prev.likesCount + 1 : prev.likesCount - 1 } : null);

    const success = await toggleProjectLike(project.id, user.uid);
    if (!success) {
      setLiked(!newLikedState);
      setProject(prev => prev ? { ...prev, likesCount: !newLikedState ? prev.likesCount + 1 : prev.likesCount - 1 } : null);
    }
    setIsLiking(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Proyecto no encontrado</h2>
        <Link href="/" className={buttonVariants({ variant: "default" })}>Volver al Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-6 gap-2 -ml-4 hover:bg-transparent hover:text-primary" })}>
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media & Details */}
        <div className="lg:col-span-2 space-y-8">
          {project.galleryUrls && project.galleryUrls.length > 0 ? (
            <div className="flex w-full gap-2 md:gap-4 h-32 md:h-56">
              {project.galleryUrls.slice(0, 3).map((img, i) => (
                <div 
                  key={i} 
                  className="flex-1 rounded-xl overflow-hidden border border-border/50 bg-muted/20 relative group shadow-lg cursor-pointer"
                  onClick={() => setLightboxImage(img)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Preview ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/20 aspect-video relative group shadow-2xl">
              {project.embedUrl ? (
                <iframe 
                  src={project.embedUrl} 
                  className="w-full h-full border-0"
                  allowFullScreen
                  title={project.title}
                />
              ) : project.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                  No hay vista previa disponible
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="capitalize font-medium px-3 py-1 text-sm">{project.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  Publicado {project.createdAt instanceof Timestamp ? project.createdAt.toDate().toLocaleDateString() : new Date(project.createdAt as string | number | Date).toLocaleDateString()}
              </span>
            </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">{project.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Stats */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Interacciones</span>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{project.likesCount}</span>
                  <span className="text-xs text-muted-foreground">Likes</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{project.commentsCount}</span>
                  <span className="text-xs text-muted-foreground">Comments</span>
                </div>
              </div>
            </div>

            <Button 
              className={`w-full h-12 text-base gap-2 transition-all ${liked ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20' : ''}`}
              variant={liked ? "outline" : "default"}
              onClick={handleLike}
              disabled={!user || isLiking}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Te gusta este proyecto' : 'Dar Like'}
            </Button>

            <div className="space-y-3 pt-4 border-t border-border/40">
              {project.embedUrl && (
                <a href={project.embedUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary", className: "w-full gap-2" })}>
                  <ExternalLink className="h-4 w-4" />
                  Visitar Proyecto
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", className: "w-full gap-2" })}>
                  <GitBranch className="h-4 w-4" />
                  Ver Código Fuente
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Section below */}
      <div className="mt-12 max-w-3xl">
        <CommentSection projectId={project.id} />
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxImage(null); }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={lightboxImage} 
            alt="Expanded preview" 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300" 
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20 hover:text-white" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxImage(null); }}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
