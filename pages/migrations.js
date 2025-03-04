import { useState, useEffect } from 'react';
import { Container, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import dynamic from 'next/dynamic';

const DOCK_SS58_FORMAT = 22;

const Migrations = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  useEffect(() => {
    const enableExtension = async () => {
      if (typeof window !== 'undefined') {
        const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
        const extensions = await web3Enable('dock-blockchain-archives');
        if (extensions.length === 0) {
          console.log('No extension installed');
          return;
        }
        const allAccounts = await web3Accounts({ss58Format: DOCK_SS58_FORMAT});
        console.log('Accounts:', allAccounts); // Log the full account object for debugging
        setAccounts(allAccounts);
      }
    };
    enableExtension();
  }, []);

  const handleSelectedAccountChange = (e) => {
    setSelectedAccount(e.target.value);
  };

  const handleSignMessage = async () => {
    if (!selectedAccount) {
      alert('Please select an account');
      return;
    }
    const { web3FromAddress } = await import('@polkadot/extension-dapp');
    const injector = await web3FromAddress(selectedAccount);
    const signRaw = injector.signer.signRaw;
    const { signature } = await signRaw({
      address: selectedAccount,
      data: message,
      type: 'bytes'
    });
    setSignature(signature);
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dock Blockchain Migrations
      </Typography>
      <FormControl sx={{ mt: 2 }}>
        <InputLabel id="account-select-label">Select Account</InputLabel>
        <Select
          labelId="account-select-label"
          value={selectedAccount}
          onChange={handleSelectedAccountChange}
          variant="outlined"
        >
          {accounts.map((account) => (
            <MenuItem key={account.address} value={account.address}>
              {account.meta.name ? `${account.meta.name} (${account.address})` : account.address}
            </MenuItem>
          ))}
        </Select>
        Select an account to sign messages
      </FormControl>
      <TextField
        label="Message"
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        multiline
        rows={4}
        sx={{ mt: 2 }}
      />
      <Button variant="contained" color="secondary" onClick={handleSignMessage} sx={{ mt: 2, mb: 2 }}>
        Sign Message
      </Button>
      {signature && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body1">Signature:</Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            {signature}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default dynamic(() => Promise.resolve(Migrations), { ssr: false });
