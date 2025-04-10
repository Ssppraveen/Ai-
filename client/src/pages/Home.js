import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Sample featured products (replace with API data later)
const featuredProducts = [
  {
    id: 1,
    name: 'iPhone 13 Pro',
    price: 999,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070edc2?auto=format&w=500',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S21',
    price: 799,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&w=500',
  },
  {
    id: 3,
    name: 'Google Pixel 6',
    price: 699,
    image: 'https://images.unsplash.com/photo-1635870723802-e88d76ae3bf5?auto=format&w=500',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const mapCategoryToApiValue = (category) => {
    if (!category) return '';
    
    // Direct mapping since we're getting the exact category names from the API
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

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&w=1600)',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Increase the priority of the hero background image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            textAlign: 'center',
            p: { xs: 3, md: 6 },
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            color="inherit"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Discover the newest smartphones and accessories at great prices
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
            sx={{ mt: 4 }}
          >
            SHOP NOW
          </Button>
        </Box>
      </Paper>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          Shop by Category
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : categories.length === 0 ? (
          <Typography align="center">No categories available</Typography>
        ) : (
          <Grid container spacing={4}>
            {categories.map((category) => (
              <Grid item key={category._id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                  }}
                  onClick={() => {
                    const apiCategory = mapCategoryToApiValue(category.name);
                    console.log('Category from API:', category.name); // Debug log
                    console.log('Mapped to API value:', apiCategory); // Debug log
                    navigate(`/products?category=${apiCategory}`);
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.image ? `http://localhost:5000${category.image}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={category.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h3" align="center">
                      {category.name}
                    </Typography>
                    {category.description && (
                      <Typography variant="body2" color="text.secondary" align="center">
                        {category.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Featured Products Section */}
      {/* Remove this entire section if you don't want featured products */}
      {/* Or replace with dynamic data fetching from API */}
      {/* <Container maxWidth="lg" sx={{ mb: 8 }}> */}
      {/*   <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}> */}
      {/*     Featured Products */}
      {/*   </Typography> */}
      {/*   <Grid container spacing={4}> */}
      {/*     {featuredProducts.map((product) => ( */}
      {/*       <Grid item key={product.id} xs={12} sm={6} md={4}> */}
      {/*         <Card */}
      {/*           sx={{ */}
      {/*             height: '100%', */}
      {/*             display: 'flex', */}
      {/*             flexDirection: 'column', */}
      {/*             cursor: 'pointer', */}
      {/*             '&:hover': { */}
      {/*               transform: 'scale(1.02)', */}
      {/*               transition: 'transform 0.2s ease-in-out', */}
      {/*             }, */}
      {/*           }} */}
      {/*           onClick={() => navigate(`/product/${product.id}`)} */}
      {/*         > */}
      {/*           <CardMedia */}
      {/*             component="img" */}
      {/*             height="300" */}
      {/*             image={product.image} */}
      {/*             alt={product.name} */}
      {/*           /> */}
      {/*           <CardContent> */}
      {/*             <Typography gutterBottom variant="h6" component="h3"> */}
      {/*               {product.name} */}
      {/*             </Typography> */}
      {/*             <Typography variant="h6" color="primary"> */}
      {/*               ${product.price} */}
      {/*             </Typography> */}
      {/*           </CardContent> */}
      {/*         </Card> */}
      {/*       </Grid> */}
      {/*     ))} */}
      {/*   </Grid> */}
      {/* </Container> */}
    </Box>
  );
};

export default Home; 