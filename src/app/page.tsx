import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";
import { Project } from "@/types";
import { ProjectCard } from "@/components/project/ProjectCard";

export default async function Dashboard() {
  let projects: Project[] = [];
  
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  } catch (error) {
    console.error("Error fetching projects: ", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      {/* Dynamic Vibrant Background - Fixed to viewport so it always shows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-pink-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mt-10 mb-16 md:mt-16 md:mb-24 gap-5 relative z-10">
        <div className="animate-float">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-1.5 text-sm font-semibold text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-md mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            Explorador Tecnológico
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground drop-shadow-xl">
          Mis <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">Proyectos</span>
        </h1>
        
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed font-medium mx-auto">
          Desarrollador y soñador. Explora mis locuras transformadas en código, electrónica y soluciones digitales.
        </p>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-primary/30 rounded-[2rem] bg-background/50 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.1)] relative z-10 mx-auto max-w-4xl">
          <h3 className="text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Aún construyendo...</h3>
          <p className="text-muted-foreground text-xl">Sé el primero en compartir algo increíble.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
