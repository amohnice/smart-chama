import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SentimentDissatisfied as SadIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <SadIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Oops! The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound; 