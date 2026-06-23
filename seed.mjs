import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDalIM8UZtw5Ji5NasRYpYTfMzYAn36KGQ",
  authDomain: "mi-sitio-web-29e4e.firebaseapp.com",
  projectId: "mi-sitio-web-29e4e",
  storageBucket: "mi-sitio-web-29e4e.firebasestorage.app",
  messagingSenderId: "70386759788",
  appId: "1:70386759788:web:c53c1034c6e0ec4ff54049",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = async () => {
  // Delete mock data
  const mockIds = ["proj-1", "proj-2", "proj-3", "proj-4"];
  for (const id of mockIds) {
    try {
      await deleteDoc(doc(db, "projects", id));
      console.log(`Proyecto falso ${id} eliminado.`);
    } catch (e) {
      console.log(`No se pudo eliminar ${id}`);
    }
  }

  // Insert real project
  const myProject = {
    id: "verdad-o-reto",
    title: "Verdad o Reto",
    description: "Juego interactivo clásico de 'Verdad o Reto'. Desarrollado por Erick Martinez para reuniones y diversión en tiempo real.",
    category: "game",
    embedUrl: "",
    repoUrl: "https://github.com/ErickGMC/verdad-o-reto",
    authorId: "erick-martinez",
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date()
  };

  try {
    await setDoc(doc(db, "projects", myProject.id), myProject);
    console.log(`Proyecto real ${myProject.id} creado.`);
  } catch (error) {
    console.error("Error al crear proyecto real:", error);
  }
  
  console.log("Actualización completada.");
  process.exit(0);
};

seedData();
