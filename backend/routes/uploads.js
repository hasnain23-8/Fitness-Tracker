const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { uploadProfilePicture, uploadProgressPhoto, getProgressPhotos, deleteProgressPhoto } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/auth');

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profiles/'),
  filename: (req, file, cb) => cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`),
});
const progressStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/progress/'),
  filename: (req, file, cb) => cb(null, `progress_${Date.now()}${path.extname(file.originalname)}`),
});
const imageFilter = (req, file, cb) =>
  file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'), false);

const upProfile = multer({ storage: profileStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const upProgress = multer({ storage: progressStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(verifyToken);
router.post('/profile', upProfile.single('image'), uploadProfilePicture);
router.post('/progress', upProgress.single('image'), uploadProgressPhoto);
router.get('/progress', getProgressPhotos);
router.delete('/progress/:id', deleteProgressPhoto);

module.exports = router;
