import { useState, useEffect } from 'react';
import { Container, TextField, Button, Select, MenuItem, Typography, Box, FormControl, InputLabel } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';

export default function Home() {
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('account');
  const [consensus, setConsensus] = useState('pos');
  const [results, setResults] = useState([]);
  const [emissions, setEmissions] = useState(0);
  const [loading, setLoading] = useState(false);

  // Automatically fetch data when accountId, type, or consensus changes
  useEffect(() => {
    if (accountId) {
      const fetchData = async () => {
        setLoading(true);
        const res = await fetch(`/api/query?accountId=${accountId}&type=${type}&consensus=${consensus}`);
        const data = await res.json();
        setResults(data);
        setLoading(false);
      };
      fetchData();
    } else {
      setResults([]);
    }
  }, [accountId, type, consensus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/query?accountId=${accountId}&type=${type}&consensus=${consensus}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const handleAccountIdChange = (e) => {
    setAccountId(e.target.value);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const handleConsensusChange = async (e) => {
    setConsensus(e.target.value);
    setEmissions('Calculating...');
    const res = await fetch(`/api/emissions?consensus=${e.target.value}`);
    const response = await res.json();
    setEmissions(response.emissions || 0);
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
    <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dock Blockchain Archives
      </Typography>
      <Typography variant="body1" gutterBottom>
        Enter an account ID to query the Dock blockchain archives for account or token transfer information.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl>
          <TextField
            label="Account ID"
            variant="outlined"
            value={accountId}
            onChange={handleAccountIdChange}
            required
          />
          <FormHelperText>The account to retrieve data for</FormHelperText>
        </FormControl>
        <FormControl>
          <Select
            value={consensus}
            onChange={handleConsensusChange}
            variant="outlined"
          >
            <MenuItem value="pos">Proof of Stake (updated April 1, 2025)</MenuItem>
            <MenuItem value="poa">Proof of Authority</MenuItem>
          </Select>
           <FormHelperText>The version of the Dock network you want to query</FormHelperText>
        </FormControl>
        <FormControl>
          <Select
            value={type}
            onChange={handleTypeChange}
            variant="outlined"
          >
            <MenuItem value="account">Account Information</MenuItem>
            <MenuItem value="transfer">Token Transfer Information</MenuItem>
            <MenuItem value="rewards" disabled={consensus === 'poa'}>Rewards (PoS only)</MenuItem>
          </Select>
           <FormHelperText>The type of data to query</FormHelperText>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Query
        </Button>
      </Box>
      {emissions > 0 && (
        <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
          Total Token Emissions: {emissions.toLocaleString()} DOCK
        </Typography>
      )}
      {results.length > 0 && (
        <Typography variant="body1" sx={{ mt: 4, mb: 1, fontWeight: 'bold' }}>
          Results: {results.length}
        </Typography>
      )}
      <Box sx={{ flexGrow: 1, overflow: 'auto', mt: results.length > 0 ? 1 : 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        {loading ? (
          <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>Loading...</Typography>
        ) : (
          <pre>{JSON.stringify(results, null, 2)}</pre>
        )}
      </Box>
      {results.length > 0 && (
        <Button variant="contained" color="secondary" onClick={handleDownload} sx={{ mt: 2, mb: 2 }}>
          Download JSON
        </Button>
      )}
    </Container>
  );
}
