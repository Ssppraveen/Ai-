import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Deals = () => {
  const navigate = useNavigate();

  const deals = [
    {
      id: 1,
      title: 'Summer Sale',
      description: 'Get up to 30% off on all smartphones',
      image: '/images/deals/summer-sale.jpg'
    },
    {
      id: 2,
      title: 'Bundle Offer',
      description: 'Buy a phone and get 20% off on accessories',
      image: '/images/deals/bundle-offer.jpg'
    },
    {
      id: 3,
      title: 'Flash Sale',
      description: 'Limited time offers on premium phones',
      image: '/images/deals/flash-sale.jpg'
    }
  ];

  const handleDealClick = (dealId) => {
    navigate(`/products?deal=${dealId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Special Deals
      </Typography>
      <Grid container spacing={3}>
        {deals.map((deal) => (
          <Grid item key={deal.id} xs={12} md={4}>
            <Card 
              onClick={() => handleDealClick(deal.id)}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={deal.image}
                alt={deal.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {deal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {deal.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Deals; 