
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ShieldTradeABI = {
  "abi": [
    {
      "inputs": [],
      "name": "getMyOffer",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "pay",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "recv",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "pay",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "recv",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "setOffer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

