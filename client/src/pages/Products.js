import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Slider,
  Divider,
  Paper,
  Alert,
  Rating,
  Chip,
  IconButton,
  CardActions,
} from '@mui/material';
import { Search, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItemAsync, openCart } from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';

// Base64 encoded placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5OTkiLz48cGF0aCBkPSJNMTEwIDEwMEgxMDBWMTIwSDkwVjEwMEg4MFY5MEgxMjBWMTAwSDExMFYxMjBIMTAwVjEwMEg5MFYxMTBIODBWMTAwSDkwVjkwSDExMFYxMDBaIiBmaWxsPSIjNjY2Ii8+PC9zdmc+';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Helper function to map API categories to display values
  const mapCategoryToDisplay = (category) => {
    if (!category) return 'Uncategorized';
    
    switch (category) {
      case 'mobile':
        return 'Smartphones';
      case 'tablet':
        return 'Tablet';
      case 'accessory':
        return 'Accessories';
      default:
        return category;
    }
  };

  // Helper function to map display categories to API values
  const mapDisplayToApiCategory = (category) => {
    if (!category || category === 'all') return 'all';
    
    // Category from URL will be API value, so no need to transform
    return category;
  };

  // Get category from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      console.log('Category from URL:', categoryParam); // Debug log
      setCategory(categoryParam);
    } else {
      setCategory('all');
    }
  }, [location]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = '/api/products';
        const params = new URLSearchParams();
        
        if (category !== 'all') {
          const apiCategory = mapDisplayToApiCategory(category);
          console.log('Using category for API:', apiCategory); // Debug log
          params.append('category', apiCategory);
        }
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        if (priceRange[0] > 0 || priceRange[1] < 2000) {
          params.append('minPrice', priceRange[0]);
          params.append('maxPrice', priceRange[1]);
        }
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        console.log('Fetching products from:', url); // Debug log
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log('Received products:', data); // Debug log
        
        // Transform products to ensure consistent data structure
        const transformedProducts = (data.products || data || []).map(product => ({
          ...product,
          countInStock: parseInt(product.countInStock || product.stock || 0),
          category: mapCategoryToDisplay(product.category)
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchTerm, priceRange]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        console.log('Fetched categories:', data); // Debug log
        
        // Transform categories to ensure consistent structure
        const transformedCategories = (data || []).map(cat => {
          const apiValue = mapCategoryToApiValue(cat.name);
          return {
            value: apiValue,
            label: cat.name // Use the original name from API for display
          };
        });
        console.log('Transformed categories:', transformedCategories); // Debug log
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to map category names to API values (same as Home page)
  const mapCategoryToApiValue = (category) => {
    if (!category) return '';
    
    switch (category) {
      case 'Smartphones':
        return 'mobile';
      case 'Tablet':
        return 'tablet';
      case 'Accessories':
        return 'accessory';
      default:
        return category.toLowerCase();
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(addItemAsync({
        productId: product._id,
        quantity: 1
      }));
      dispatch(openCart());
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        All Products
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>

            {/* Search */}
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Category Filter */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => {
                  const newCategory = e.target.value;
                  console.log('Selected category:', newCategory); // Debug log
                  setCategory(newCategory);
                  
                  // Update URL with new category
                  const params = new URLSearchParams(location.search);
                  if (newCategory === 'all') {
                    params.delete('category');
                  } else {
                    params.set('category', newCategory);
                  }
                  navigate(`/products?${params.toString()}`);
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Price Range Filter */}
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Price Range</Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={2000}
                step={50}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">${priceRange[0]}</Typography>
                <Typography variant="body2">${priceRange[1]}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Product Grid */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleProductClick(product._id)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images?.[0] ? 
                      (product.images[0].startsWith('http') ? 
                        product.images[0] : 
                        `http://localhost:5000/${product.images[0].replace(/\\/g, '/')}`) 
                      : PLACEHOLDER_IMAGE}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                    sx={{ objectFit: 'contain', p: 1 }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {product.brand}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.numReviews || 0})
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                    <Chip 
                      label={product.countInStock > 0 ? 'In Stock' : 'Out of Stock'} 
                      color={product.countInStock > 0 ? 'success' : 'error'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.countInStock <= 0}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Products; 