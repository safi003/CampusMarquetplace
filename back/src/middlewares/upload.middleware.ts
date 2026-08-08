import multer from "multer";

// Le fichier est conservé en mémoire, puis envoyé vers RustFS (voir src/lib/storage.ts)

// filtre : n'accepte que les images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont acceptées"));
  }
};

export const upload = multer({ storage: multer.memoryStorage(), fileFilter });

export const uploadProductImages = multer({ storage: multer.memoryStorage(), fileFilter });