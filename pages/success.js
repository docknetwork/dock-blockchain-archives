import { useRouter } from 'next/router';
import { Container, Typography, Box } from '@mui/material';

const Success = () => {
  const router = useRouter();
  const { data } = router.query;
  const migrationData = data ? JSON.parse(data) : {};

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Migration Request Submitted
      </Typography>
      <Typography variant="body1" gutterBottom>
        Your migration request has been successfully submitted. The converted CHEQ amount will be available in the indicated cheqd wallet within 1-2 business days.
      </Typography>
      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" sx={{ wordBreak: 'break-all', mt: 2 }}>
          Submitted Data:
        </Typography>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(migrationData, null, 2)}
        </pre>
      </Box>
    </Container>
  );
};

export default Success;
