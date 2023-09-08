## Directory structure¶
The default Truffle directory structure contains the following:

`contracts/`: Contains the Solidity source files for our smart contracts. There is an important contract in here called Migrations.sol, which we'll talk about later.
`migrations/`: Truffle uses a migration system to handle smart contract deployments. A migration is an additional special smart contract that keeps track of changes.
`test/`: Contains both JavaScript and Solidity tests for our smart contracts
`truffle-config.js`: Truffle configuration file

The `pet-shop` Truffle Box has extra files and folders in it, but we won't worry about those just yet.