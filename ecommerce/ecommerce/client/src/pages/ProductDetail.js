import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  Rating,
  Divider,
  CircularProgress,
  Alert,
  ImageList,
  ImageListItem,
  Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItemAsync, openCart } from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Base64 encoded placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5OTkiLz48cGF0aCBkPSJNMTEwIDEwMEgxMDBWMTIwSDkwVjEwMEg4MFY5MEgxMjBWMTAwSDExMFYxMjBIMTAwVjEwMEg5MFYxMTBIODBWMTAwSDkwVjkwSDExMFYxMDBaIiBmaWxsPSIjNjY2Ii8+PC9zdmc+';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        const productData = {
          ...data,
          countInStock: parseInt(data.countInStock || data.stock || 0)
        };
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await dispatch(addItemAsync({ productId: product._id, quantity: 1 })).unwrap();
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

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box
              component="img"
              src={product.images?.[selectedImage] ? 
                (product.images[selectedImage].startsWith('http') ? 
                  product.images[selectedImage] : 
                  `http://localhost:5000/${product.images[selectedImage].replace(/\\/g, '/')}`) 
                : PLACEHOLDER_IMAGE}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PLACEHOLDER_IMAGE;
              }}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'contain',
              }}
            />
          </Paper>
          {product.images?.length > 1 && (
            <ImageList sx={{ width: '100%', height: 100 }} cols={4} rowHeight={100}>
              {product.images.map((image, index) => (
                <ImageListItem 
                  key={index}
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid #1976d2' : 'none',
                    borderRadius: 1
                  }}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.startsWith('http') ? image : `http://localhost:5000/${image.replace(/\\/g, '/')}`}
                    alt={`${product.name} view ${index + 1}`}
                    loading="lazy"
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" color="primary" sx={{ mr: 2 }}>
                ${product.price}
              </Typography>
              <Chip 
                label={product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Out of Stock'} 
                color={product.countInStock > 0 ? 'success' : 'error'}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Rating value={product.rating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.numReviews || 0} reviews)
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Brand: {product.brand}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Category: {product.category}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            {product.features && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Key Features
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {product.features.map((feature, index) => (
                    <Typography component="li" key={index} paragraph>
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </>
            )}

            {product.specifications && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Specifications
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" component="span">
                        {key}:
                      </Typography>
                      <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={product.countInStock <= 0}
                fullWidth
              >
                {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail; 