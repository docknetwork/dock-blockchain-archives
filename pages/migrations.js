import { useState, useEffect } from 'react';
import { Container, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import dynamic from 'next/dynamic';

const DOCK_SS58_FORMAT = 22;

const Migrations = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [balance, setBalance] = useState(0);

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

  const fetchAccountBalance = async (accountId) => {
    const res = await fetch(`/api/query?accountId=${accountId}&type=account&consensus=pos`);
    const data = await res.json();
    let tokenBalance = 0;
    if (data.length > 0) {
      tokenBalance = data[0].balance;
    } 
    setBalance(tokenBalance);
    
    return tokenBalance;
  };

  const handleSelectedAccountChange = async (e) => {
    const accountId = e.target.value;
    setSelectedAccount(accountId);
    const tokens = await fetchAccountBalance(accountId);
    const migrationData = {
      dockAccount: accountId,
      cheqdAccount: '',
      dockTokens: tokens,
      requestDate: new Date().toISOString()
    };
    setMessage(migrationData)
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
          <Box>
            <Typography variant="body1" sx={{ mt: 2 }}>
              DOCK Balance: {balance} DOCK<br />
              Migrated CHEQ Balance: {balance/18.5178} CHEQ
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all', mt: 2 }}
              label="Message"
            >
              Migration data: {JSON.stringify(message, null, "\t")}
            </Typography>
          </Box>
        )}
      </FormControl>
      <Button variant="contained" color="secondary" onClick={handleSignMessage} sx={{ mt: 2, mb: 2 }}>
        Sign & Submit
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
