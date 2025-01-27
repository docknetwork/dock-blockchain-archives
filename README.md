# Dock Blockchain Archives

This project provides an API and a simple web UI to query blockchain data related to accounts and transfers in the Dock blockchain.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/dock-blockchain-archives.git
    cd dock-blockchain-archives
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

### Running the Project

1. Start the development server:
    ```bash
    npm run dev
    ```

2. The server will start on `http://localhost:3000`.

### API Endpoints

#### Query Endpoint

- **URL:** `/api/query`
- **Method:** `GET`
- **Query Parameters:**
  - `accountId` (required): The account ID to query.
  - `type` (required): The type of data to query. Can be either `account` or `transfer`.

- **Example Request:**
    ```bash
    curl "http://localhost:3000/api/query?accountId=0x123&type=account"
    ```

- **Example Response:**
    ```json
    [
      {
        "account_display": {
          "address": "3Gry8Y6tjNvNVM9u4gpvjXAChHvbZNzmZzNDbmGs15W7g4Ci"
        },
        "address": "3Gry8Y6tjNvNVM9u4gpvjXAChHvbZNzmZzNDbmGs15W7g4Ci",
        "balance": "1000",
        "balance_lock": "0",
        "count_extrinsic": 0,
        "derive_token": null,
        "is_erc20": false,
        "is_evm_contract": false,
        "lock": "0",
        "registrar_info": null
      }
    ]
    ```

### Project Structure

- `pages/api/query.js`: The main API endpoint for querying blockchain data.
- `archives/poa`: Directory containing JSON files with blockchain data.

### Notes

- Ensure that the `archives/poa` directory contains the necessary JSON files (`dock-poa-accounts.json` and `dock-poa-transfers.json`) for the API to function correctly.

## License

This project is licensed under the MIT License.
