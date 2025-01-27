import { useState } from 'react';
import { Container, TextField, Button, Select, MenuItem, Typography, Box } from '@mui/material';

export default function Home() {
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('account');
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/query?accountId=${accountId}&type=${type}`);
    const data = await res.json();
    setResults(data);
  };

  const handleAccountIdChange = (e) => {
    setAccountId(e.target.value);
    setResults([]);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setResults([]);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${accountId}-${type}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Dock Blockchain Archives
      </Typography>
      <Typography variant="body1" gutterBottom>
        Enter an account ID to query the Dock blockchain archives for account or token transfer information.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Account ID"
          variant="outlined"
          value={accountId}
          onChange={handleAccountIdChange}
          required
        />
        <Select
          value={type}
          onChange={handleTypeChange}
          variant="outlined"
        >
          <MenuItem value="account">Account Information</MenuItem>
          <MenuItem value="transfer">Token Transfer Information</MenuItem>
        </Select>
        <Button type="submit" variant="contained" color="primary">
          Query
        </Button>
      </Box>
      <Box component="pre" sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        {JSON.stringify(results, null, 2)}
      </Box>
      {results.length > 0 && (
        <Button variant="contained" color="secondary" onClick={handleDownload} sx={{ mt: 2 }}>
          Download JSON
        </Button>
      )}
    </Container>
  );
}
