const { deleteFile } = require('../middleware/upload.middleware');
const { fileLogger } = require('../middleware/logger.middleware');

async function deleteImages(imagePaths) {
    try {
        for (const imagePath of imagePaths) {
            await deleteImage(imagePath);
        }
    } catch (error) {
        fileLogger.error(`Failed to delete image: ${error.message}`);
    }
}

async function deleteImage(imagePath) {
    try {
        if (imagePath) {
            await deleteFile(imagePath);
        }
    } catch (error) {
        fileLogger.error(`Failed to delete image: ${error.message}`);
    }
}

module.exports = { 
    deleteImages: deleteImages,
    deleteImage: deleteImage
 };