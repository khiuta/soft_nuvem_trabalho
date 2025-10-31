import multer from 'multer';
import { extname, resolve } from 'path';

// random file name
const aleatorio = () => Math.floor(Math.random() * 10000 + 10000);

const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default {
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return cb(new multer.MulterError('File needs to be XLSX.'));
    }

    return cb(null, true);
  },
  // specifying where the file is going
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, resolve(__dirname, '..', '..', 'uploads', 'files'));
    },
    // setting the file name
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    },
  }),
};