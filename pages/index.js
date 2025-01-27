import { useState } from 'react';

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

  return (
    <div>
      <h1>Blockchain Query</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="Account ID"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="account">Account Information</option>
          <option value="transfer">Token Transfer Information</option>
        </select>
        <button type="submit">Query</button>
      </form>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
