import multer from "multer";
import path from "path";

// storage définit OÙ et COMMENT le fichier est sauvegardé sur le disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/cartes-scolaires"); // dossier de destination
  },
  filename: (req, file, cb) => {
    // évite les collisions de noms : timestamp + extension originale
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// filtre : n'accepte que les images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont acceptées"));
  }
};

export const upload = multer({ storage, fileFilter });

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploadProductImages = multer({ storage: productStorage, fileFilter });