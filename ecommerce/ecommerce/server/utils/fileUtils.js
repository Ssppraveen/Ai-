const fs = require('fs');
const path = require('path');

const createUploadsDir = () => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  const productUploadsDir = path.join(uploadDir, 'products');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  if (!fs.existsSync(productUploadsDir)) {
    fs.mkdirSync(productUploadsDir);
  }
};

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  createUploadsDir,
  deleteFile
}; 