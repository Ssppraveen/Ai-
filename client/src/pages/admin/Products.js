import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    countInStock: '',
    brand: '',
    image: null,
    specifications: {}
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      // Transform the data to ensure consistent field names
      const transformedProducts = (data.products || data || []).map(product => ({
        ...product,
        countInStock: product.countInStock || product.stock || 0,
        category: mapCategoryForDisplay(product.category)
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      // Ensure data is an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Initialize with empty array to prevent map error
      setCategories([]);
    }
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        countInStock: product.stock || product.countInStock,
        brand: product.brand || '',
        image: null,
        specifications: product.specifications || {}
      });
    } else {
      setEditProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        countInStock: '',
        brand: '',
        image: null,
        specifications: {}
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Product name is required');
        return;
      }
      
      if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        alert('Valid price is required');
        return;
      }
      
      if (!formData.category) {
        alert('Category is required');
        return;
      }

      // Find the selected category
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      if (!selectedCategory) {
        alert('Invalid category selected');
        return;
      }

      // Map category name to server-expected value
      let serverCategory;
      const categoryName = selectedCategory.name.toLowerCase();
      if (categoryName.includes('phone') || categoryName.includes('mobile')) {
        serverCategory = 'mobile';
      } else if (categoryName.includes('tablet')) {
        serverCategory = 'tablet';
      } else if (categoryName.includes('accessor')) {
        serverCategory = 'accessory';
      } else {
        alert('Invalid category type. Must be a smartphone, tablet, or accessory');
        return;
      }
      
      // Validate and parse stock value
      const stockValue = parseInt(formData.countInStock);
      if (isNaN(stockValue) || stockValue < 0) {
        alert('Valid stock count is required (must be 0 or greater)');
        return;
      }

      if (!formData.brand.trim()) {
        alert('Brand is required');
        return;
      }

      // Create FormData object
      const productData = new FormData();
      productData.append('name', formData.name.trim());
      productData.append('description', formData.description.trim());
      productData.append('price', parseFloat(formData.price));
      productData.append('category', serverCategory);
      productData.append('brand', formData.brand.trim());
      productData.append('stock', stockValue);
      
      // Add default specifications
      const specifications = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: serverCategory,
        price: parseFloat(formData.price),
        stock: stockValue
      };
      productData.append('specifications', JSON.stringify(specifications));
      
      if (formData.image) {
        productData.append('images', formData.image);
      }

      const token = localStorage.getItem('token');
      const url = editProduct ? `/api/products/${editProduct._id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'x-auth-token': token
        },
        body: productData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      await fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/products/${id}`, { 
          method: 'DELETE',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete product: ${response.status}`);
        }
        
        setProducts(products.filter(product => product._id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Add helper function for category mapping
  const mapCategoryForDisplay = (category) => {
    switch (category?.toLowerCase()) {
      case 'mobile':
        return 'Smartphone';
      case 'tablet':
        return 'Tablet';
      case 'accessory':
        return 'Accessory';
      default:
        return category;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Products Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.countInStock || 0}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(product)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    id="product-name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    aria-label="Product name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    id="product-description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    required
                    autoComplete="off"
                    aria-label="Product description"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    id="product-price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    inputProps={{ 
                      min: 0, 
                      step: "0.01",
                      'aria-label': 'Product price'
                    }}
                    autoComplete="off"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock"
                    name="countInStock"
                    id="product-stock"
                    type="number"
                    value={formData.countInStock}
                    onChange={handleInputChange}
                    required
                    inputProps={{ 
                      min: 0, 
                      step: 1,
                      'aria-label': 'Product stock quantity'
                    }}
                    autoComplete="off"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="product-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Category"
                      aria-label="Product category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    name="brand"
                    id="product-brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    aria-label="Product brand"
                  />
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="image-upload"
                    name="product-image"
                    aria-label="Upload product image"
                  />
                  <label htmlFor="image-upload">
                    <Button 
                      variant="outlined" 
                      component="span"
                      aria-label="Choose product image"
                    >
                      Upload Image
                    </Button>
                  </label>
                  {formData.image && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {formData.image.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleClose}
              aria-label="Cancel product creation"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              aria-label={editProduct ? 'Update product' : 'Create product'}
            >
              {editProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Products; 