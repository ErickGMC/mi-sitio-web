"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";
import { Project } from "@/types";
import { Code } from "lucide-react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData: Project[] = [];
      snapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Dynamic Watercolor Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-fuchsia-400/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-yellow-400/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 gap-8 pt-4">
        <div className="space-y-4 flex-1 text-center md:text-left relative z-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/50 px-3 py-1 text-xs font-semibold backdrop-blur-sm text-primary shadow-sm mb-1">
            🚀 Explorador Tecnológico
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground drop-shadow-md">
            Mis <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500">Proyectos</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed font-medium">
            Desarrollador y soñador. Explora mis locuras en tecnología, física y electrónica.
          </p>
        </div>

        {/* Compact Avatar Section */}
        <div className="flex flex-col items-center md:items-end gap-3 group">
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 transition-transform duration-500 group-hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-400 p-[3px] shadow-[0_0_20px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow duration-500">
              <div className="w-full h-full rounded-full overflow-hidden bg-background border-2 border-background relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/foto-portada.webp" 
                  alt="Erick Martinez" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://github.com/ErickGMC.png'; // Fallback to GitHub profile
                  }}
                />
              </div>
            </div>
            
            {/* Small decorative floating icon */}
            <div className="absolute -bottom-1 -right-1 bg-background border border-cyan-500/50 p-1.5 rounded-full shadow-sm">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="font-semibold text-sm text-foreground">Erick Martinez</p>
            <p className="text-xs text-muted-foreground">Sobre mí</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 rounded-2xl bg-muted/10">
          <h3 className="text-2xl font-bold mb-2">No hay proyectos aún</h3>
          <p className="text-muted-foreground">Sé el primero en compartir algo increíble.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
