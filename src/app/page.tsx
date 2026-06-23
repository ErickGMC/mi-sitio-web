"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";
import { Project } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlusCircle, Cpu, Zap, Code, Atom } from "lucide-react";
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

      {/* Hero Section */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center mb-20 gap-12 pt-10">
        <div className="space-y-6 flex-1 text-center md:text-left relative z-10">
          <div className="inline-flex items-center rounded-full border-2 border-primary/20 bg-background/50 px-3 py-1 text-sm font-semibold backdrop-blur-sm text-primary shadow-sm mb-2 animate-float">
            🚀 Creador de Proyectos
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground drop-shadow-md">
            Erick <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500">Martinez</span>
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl leading-relaxed font-medium">
            Desarrollador, ingeniero y soñador. Explora mis locuras en tecnología, física y electrónica.
          </p>
        </div>

        {/* Floating Avatar Sector */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 animate-float" style={{ animationDelay: '1s' }}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-400 p-2 shadow-[0_0_40px_rgba(34,211,238,0.4)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-background border-4 border-background relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/foto-portada.png" 
                alt="Erick Martinez" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://github.com/ErickGMC.png'; // Fallback to GitHub profile
                }}
              />
            </div>
          </div>
          
          {/* Floating Tech Badges */}
          <div className="absolute -top-4 -left-4 bg-background border-2 border-cyan-500/50 p-3 rounded-2xl shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="absolute top-1/2 -right-8 bg-background border-2 border-fuchsia-500/50 p-3 rounded-2xl shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
            <Code className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div className="absolute -bottom-6 left-1/4 bg-background border-2 border-yellow-500/50 p-3 rounded-2xl shadow-lg animate-float" style={{ animationDelay: '2.5s' }}>
            <Atom className="w-6 h-6 text-yellow-400" />
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
