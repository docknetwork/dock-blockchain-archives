import { useState, useEffect } from 'react';
import { Container, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, TextField, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';
import { fromBech32 } from '@cosmjs/encoding';

const DOCK_SS58_FORMAT = 22;

const Migrations = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [cheqdAccount, setCheqdAccount] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cheqdAddressError, setCheqdAddressError] = useState('');
  const [alreadyMigrated, setAlreadyMigrated] = useState(false);

  useEffect(() => {
    const enableExtension = async () => {
      if (typeof window !== 'undefined') {
        const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
        const extensions = await web3Enable('dock-blockchain-archives');
        if (extensions.length === 0) {
          console.log('No extension installed');
          return;
        }
        const allAccounts = await web3Accounts({ ss58Format: DOCK_SS58_FORMAT });
        console.log('Accounts:', allAccounts); // Log the full account object for debugging
        setAccounts(allAccounts);
      }
    };
    enableExtension();
  }, []);

  function convertDockToCheqd(dockBalance) {
    if (!dockBalance) {
      return 0;
    }
    const swapRatio = 18.5178;
    const cheqdBalance = dockBalance / swapRatio;
    return cheqdBalance;
  }

  const fetchAccountBalance = async (accountId) => {
    setLoading(true);
    const res = await fetch(`/api/query?accountId=${accountId}&type=account&consensus=pos`);
    const data = await res.json();
    let tokenBalance = 0;
    if (data.length > 0) {
      tokenBalance = data[0].balance;
    } 
    setBalance(tokenBalance);
    setLoading(false);
    
    return tokenBalance;
  };

  const checkIfAlreadyMigrated = async (accountId) => {
    const res = await fetch(`/api/migrations?accountId=${accountId}`);
    const data = await res.json();
    return data.alreadyMigrated;
  };

  const handleSelectedAccountChange = async (e) => {
    const accountId = e.target.value;
    setSelectedAccount(accountId);
    const alreadyMigrated = await checkIfAlreadyMigrated(accountId);
    setAlreadyMigrated(alreadyMigrated);
    if (!alreadyMigrated) {
      const tokens = await fetchAccountBalance(accountId);
      const migrationData = {
        dockAccount: accountId,
        cheqdAccount: cheqdAccount,
        dockTokens: tokens,
        requestDate: new Date().toISOString()
      };
      setMessage(migrationData)
    }
  };

  const handleCheqdAccountChange = (e) => {
    const address = e.target.value;
    setCheqdAccount(address);
    if (isValidCheqdAddress(address)) {
      setCheqdAddressError('');
      const migrationData = {
        dockAccount: selectedAccount,
        cheqdAccount: address,
        dockTokens: balance,
        requestDate: new Date().toISOString()
      };
      setMessage(migrationData);
    } else {
      setCheqdAddressError('Invalid cheqd address');
    }
  };

  function isValidCheqdAddress(address) {
    try {
      const decoded = fromBech32(address);
      if (decoded.prefix !== 'cheqd') {
        return false;
      }
  
      if (decoded.data.length !== 20) {
        return false;
      }
  
      return true;
    } catch (err) {
      return false;
    }
  }
  
  const handleSignMessage = async () => {
    if (!selectedAccount) {
      alert('Please select an account');
      return;
    }
    if (!cheqdAccount || cheqdAddressError) {
      alert('Please enter a valid cheqd account');
      return;
    }
    if (alreadyMigrated) {
      alert('This Dock account has already been migrated');
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

    const migrationObject = {
      ...message,
      signature
    };

    await fetch('/api/migrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(migrationObject)
    });
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dock Blockchain Migration
      </Typography>
      <p style={{
        fontSize: '18px',
        marginBottom: '20px',
      }}>
        The Dock network has migrated its functionality and all tokens to the cheqd blockchain. This migration will allow Dock to leverage cheqd’s advanced infrastructure and bring enhanced value to both ecosystems. Existing $DOCK tokens will be converted into $CHEQ tokens, ensuring a smooth transition for all token holders. 
      </p>
      
      <p style={{
        fontSize: '18px',
        marginBottom: '20px',
      }}>
        Before you start the process make sure you have a cheqd account. If you do not currently have one, <a href="https://docs.cheqd.io/product/network/wallets" target="_blank">see instructions on how to create one</a>.
      </p>
      
      <p style={{
        fontSize: '18px',
      }}>
        To migrate your $DOCK tokens:
      </p>
      <ol
        style={{
        fontSize: '18px',
        marginBottom: '20px',
        lineHeight: '34px',
      }}>
        <li>
          Select your Dock account. If it isn't there follow <a href="https://docs.dock.io/dock-token/dock-token-migration/adding-account-to-the-dock-browser-wallet" target="_blank">these instructions</a>.
        </li>
        <li>
          Connect your cheqd wallet or enter your cheqd account manually. Connecting a Leap wallet will allow us to confirm that the tokens are going to the cheqd account that you control. 
        </li>
        <li>
          Accept T&Cs and click <strong>Submit</strong>
        </li>
        <li>
          Authorize the transaction by entering your account password. Click <strong>Sign & Submit</strong>
        </li>
      </ol>
      
      <p style={{
        fontSize: '18px',
        marginBottom: '20px',
      }}>
        The entire amount of the account will be migrated at once. After the migration request is submitted your $DOCK tokens will be burnt and you will be sent the converted CHEQD amount with <strong>Swap Ratio</strong>: 18.5178 $DOCK to 1 $CHEQ. The migration will take up to 1-2 business days to complete, after that the converted $CHEQ amount will be available in the indicated cheqd wallet.
      </p>
      
      <p style={{
        fontSize: '18px',
        marginBottom: '20px',
      }}>
        Please follow these instructions carefully and contact our team with any questions at <a href="mailto:support@dock.io">support@dock.io</a>.
      </p>

      <FormControl sx={{ mt: 2 }}>
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
        Select the DOCK account to migrate
        {selectedAccount && (
          <Box label="accountDetails" sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Fetching balance...</Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  DOCK Balance: {balance} DOCK<br />
                  Expected migrated CHEQ Balance: {convertDockToCheqd(balance)} CHEQ
                </Typography>
                {alreadyMigrated && (
                  <Typography variant="body1" color="error" sx={{ mt: 2 }}>
                    This Dock account has already been migrated.
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}
      </FormControl>
      <TextField
        label="Cheqd Account"
        variant="outlined"
        value={cheqdAccount}
        onChange={handleCheqdAccountChange}
        error={!!cheqdAddressError}
        helperText={cheqdAddressError}
        sx={{ mt: 2 }}
      />
      <Button variant="contained" color="secondary" onClick={handleSignMessage} sx={{ mt: 2, mb: 2 }} disabled={alreadyMigrated}>
        Sign & Submit
      </Button>
      {signature && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body1" sx={{ wordBreak: 'break-all', mt: 2 }}
            label="Message"
          >
            Migration data: {JSON.stringify(message, null, "\t")}
          </Typography>
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
