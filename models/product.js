function validateProduct(product) {
  if (!product.name || product.name.length < 3 || product.name.length > 255) {
      return "Name must be between 3 and 255 characters.";
  }
  
  if (!product.price || product.price < 1 || product.price > 9999) {
      return "Price must be between 1 and 9999.";
  }
  return null;
}

module.exports = validateProduct;