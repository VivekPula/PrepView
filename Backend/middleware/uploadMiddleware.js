import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'text/plain' ||
    file.originalname.endsWith('.pdf') ||
    file.originalname.endsWith('.txt')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and TXT files are allowed for resume upload'), false);
  }
};

export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});
