"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Project } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Heart, MessageSquare, ExternalLink, GitBranch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toggleProjectLike, checkUserProjectLike } from "@/services/db";

interface ProjectCardProps {
  project: Project;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "game": return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20";
    case "store": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
    case "music": return "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border-pink-500/20";
    case "electronics": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20";
    default: return "bg-gray-500/10 text-gray-500";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "game": return "Videojuego";
    case "store": return "E-Commerce";
    case "music": return "Música/Audio";
    case "electronics": return "Electrónica";
    default: return category;
  }
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [optimisticDiff, setOptimisticDiff] = useState(0);

  const likesCount = Math.max(0, (project.likesCount || 0) + optimisticDiff);

  useEffect(() => {
    // Reset optimistic diff when we receive new data from server or component unmounts liking state
    if (!isLiking) {
      setOptimisticDiff(0);
    }
  }, [project.likesCount, isLiking]);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (user) {
        const isLiked = await checkUserProjectLike(project.id, user.uid);
        setLiked(isLiked);
      } else {
        setLiked(false);
      }
    };
    fetchLikeStatus();
  }, [project.id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || isLiking) return;

    setIsLiking(true);
    // Optimistic Update
    const newLikedState = !liked;
    setLiked(newLikedState);
    setOptimisticDiff(prev => newLikedState ? prev + 1 : prev - 1);

    const success = await toggleProjectLike(project.id, user.uid);
    if (!success) {
      // Revert if failed
      setLiked(!newLikedState);
      setOptimisticDiff(0);
    }
    setIsLiking(false);
  };

  return (
    <Card className="group relative overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-sm border-border/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {project.thumbnailUrl && (
        <div className="w-full h-48 relative overflow-hidden bg-muted/20 border-b border-border/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={project.thumbnailUrl} 
            alt={`Vista previa de ${project.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <CardHeader className="p-5 pb-4 space-y-3 relative z-10">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={`capitalize font-medium border ${getCategoryColor(project.category)}`}>
            {getCategoryLabel(project.category)}
          </Badge>
          <div className="flex items-center gap-1">
            {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label="Repositorio" onClick={(e) => e.stopPropagation()} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" })}>
                  <GitBranch className="h-4 w-4" />
                </a>
            )}
            {project.embedUrl && (
                <a href={project.embedUrl} target="_blank" rel="noopener noreferrer" aria-label="Sitio en vivo" onClick={(e) => e.stopPropagation()} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" })}>
                  <ExternalLink className="h-4 w-4" />
                </a>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-grow relative z-10">
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
          {project.description}
        </p>
      </CardContent>

      <CardFooter className="p-5 pt-4 border-t border-border/40 bg-muted/20 flex justify-between items-center relative z-10 mt-auto">
        <div className="flex gap-4 items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1.5 px-2 -ml-2 transition-all ${liked ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'}`}
            onClick={handleLike}
            disabled={!user || isLiking}
          >
            <Heart className={`h-4 w-4 transition-all duration-300 ${liked ? 'fill-current scale-110' : 'scale-100 group-hover/btn:scale-110'}`} />
            <span className="font-medium text-sm">{likesCount}</span>
          </Button>

          <Link href={`/project/${project.id}`} className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5 px-2 text-muted-foreground hover:text-foreground" })}>
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium text-sm">{project.commentsCount}</span>
          </Link>
        </div>
        
        <Link href={`/project/${project.id}`} className={buttonVariants({ size: "sm", variant: "secondary", className: "font-medium text-xs rounded-full hover:bg-primary hover:text-primary-foreground transition-colors" })}>Ver Detalle</Link>
      </CardFooter>
    </Card>
  );
};
