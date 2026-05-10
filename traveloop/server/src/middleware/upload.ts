import { randomUUID } from 'crypto';
import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const folder = file.fieldname === 'profilePhoto' ? 'uploads/avatars' : 'uploads/covers';
    cb(null, path.join(__dirname, '../../', folder));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${(randomUUID())}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
