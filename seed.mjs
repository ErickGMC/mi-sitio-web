import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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
  const projects = [
    {
      id: "proj-1",
      title: "Neon Racing (WebGL)",
      description: "Un juego de carreras futurista hecho en Three.js con físicas personalizadas y soporte para gamepad.",
      category: "game",
      embedUrl: "https://itch.io/embed-upload/7331904?color=333333", // Example generic iframe
      repoUrl: "https://github.com/erfox/neon-racing",
      authorId: "admin-seed",
      likesCount: 142,
      commentsCount: 0,
      createdAt: new Date()
    },
    {
      id: "proj-2",
      title: "AudioWave Player",
      description: "Reproductor de música con visualizador de frecuencias en tiempo real usando la Web Audio API.",
      category: "music",
      embedUrl: "",
      repoUrl: "https://github.com/erfox/audiowave",
      authorId: "admin-seed",
      likesCount: 89,
      commentsCount: 0,
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: "proj-3",
      title: "TechGear E-Commerce",
      description: "Tienda en línea completa con carrito de compras, integración de pagos con Stripe y CMS headless.",
      category: "store",
      embedUrl: "",
      repoUrl: "https://github.com/erfox/techgear",
      authorId: "admin-seed",
      likesCount: 256,
      commentsCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 2)
    },
    {
      id: "proj-4",
      title: "Arduino Smart Home Dashboard",
      description: "Panel de control para domótica conectada vía WebSockets a un servidor NodeMCU ESP8266.",
      category: "electronics",
      embedUrl: "",
      repoUrl: "https://github.com/erfox/smarthome",
      authorId: "admin-seed",
      likesCount: 310,
      commentsCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 5)
    }
  ];

  console.log("Seeding data...");
  for (const project of projects) {
    try {
      await setDoc(doc(db, "projects", project.id), project);
      console.log(`Proyecto ${project.id} creado.`);
    } catch (error) {
      console.error("Error al crear proyecto:", error);
    }
  }
  console.log("Seed completado.");
  process.exit(0);
};

seedData();
