const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  storage: multer.memoryStorage(), //important to populate req.file.buffer
});

export default upload;
