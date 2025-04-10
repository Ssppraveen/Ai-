import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';

// Dummy data - replace with API call
const products = [
  {
    id: 1,
    name: 'iPhone 13 Pro',
    price: 999.99,
    brand: 'Apple',
    category: 'smartphone',
    image: 'https://example.com/iphone13.jpg',
    description: 'Latest iPhone with pro camera system',
  },
  // Add more products
];

const brands = ['Apple', 'Samsung', 'Google', 'OnePlus'];
const categories = ['Smartphones', 'Tablets', 'Accessories'];

function ProductList() {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? [searchParams.get('category')] : []
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredProducts = products
    .filter((product) =>
      searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .filter((product) =>
      selectedBrands.length > 0
        ? selectedBrands.includes(product.brand)
        : true
    )
    .filter((product) =>
      selectedCategories.length > 0
        ? selectedCategories.includes(product.category)
        : true
    )
    .filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Search
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Sort By
            </Typography>
            <FormControl fullWidth>
              <Select value={sortBy} onChange={handleSortChange}>
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="name-asc">Name: A to Z</MenuItem>
                <MenuItem value="name-desc">Name: Z to A</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Price Range
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={2000}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>${priceRange[0]}</Typography>
              <Typography>${priceRange[1]}</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Brands
            </Typography>
            <FormGroup>
              {brands.map((brand) => (
                <FormControlLabel
                  key={brand}
                  control={
                    <Checkbox
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                  }
                  label={brand}
                />
              ))}
            </FormGroup>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <FormGroup>
              {categories.map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(category.toLowerCase())}
                      onChange={() => handleCategoryChange(category.toLowerCase())}
                    />
                  }
                  label={category}
                />
              ))}
            </FormGroup>
          </Box>
        </Grid>

        {/* Product Grid */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={4}>
            {filteredProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      ${product.price}
                    </Typography>
                    <Button
                      component={Link}
                      to={`/product/${product.id}`}
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProductList; 