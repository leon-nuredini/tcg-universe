const { deleteImage } = require('./file.utils');

const handleImageUpdate = async (newPath, oldPath) => {
    // Delete the old image if it exists or return the existing image path
    if (newPath && oldPath && newPath !== oldPath) {
        await deleteImage(oldPath);
    }
    return newPath || oldPath;
};

module.exports.handleImageUpdate = handleImageUpdate;