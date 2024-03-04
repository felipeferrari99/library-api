const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dsv8lpacy',
    api_key: '492136524526158',
    api_secret: 'i7gahOF5GlT9EQRHUJIwrPvl2QU'
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'library',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
};