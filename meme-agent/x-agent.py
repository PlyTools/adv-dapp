import os
from web3 import Web3
from solcx import compile_source, install_solc, get_installed_solc_versions, set_solc_version

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o-mini")

from langchain_core.messages import HumanMessage, SystemMessage

# Update MEME contract template to match OpenZeppelin 5.1.0
MEME_TOKEN_TEMPLATE = '''
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MemeToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
'''

# Connect to Ganache
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

def deploy_meme_contract(token_name, token_symbol):
    # Verify connection to network
    if not w3.is_connected():
        raise Exception("Not connected to Ethereum network")

    # Check if we have accounts available
    if len(w3.eth.accounts) == 0:
        raise Exception("No accounts found. Make sure Ganache is running")
    
    SOLC_VERSION = '0.8.20'
    if SOLC_VERSION not in [str(v) for v in get_installed_solc_versions()]:
        install_solc(SOLC_VERSION)
    set_solc_version(SOLC_VERSION)
    
    current_dir = "./"
    node_modules_path = os.path.join(current_dir, 'node_modules')
    
    if not os.path.exists(node_modules_path):
        raise Exception("node_modules directory not found. Please run 'npm install' first.")
    
    # Update compilation settings
    import_remapping = [
        f"@openzeppelin/contracts={os.path.join(node_modules_path, '@openzeppelin', 'contracts')}"
    ]
    
    compiled_sol = compile_source(
        MEME_TOKEN_TEMPLATE,
        import_remappings=import_remapping,
        base_path=current_dir,
        allow_paths=[current_dir, node_modules_path]
    )
    
    contract_interface = compiled_sol['<stdin>:MemeToken']
    
    MemeToken = w3.eth.contract(
        abi=contract_interface['abi'],
        bytecode=contract_interface['bin']
    )
    
    account = w3.eth.accounts[0]
    
    # Estimate gas for deployment
    constructor_txn = MemeToken.constructor(token_name, token_symbol).build_transaction({
        'from': account,
        'nonce': w3.eth.get_transaction_count(account),
        'gas': 5000000,  # Increased gas limit
        'gasPrice': w3.eth.gas_price
    })
    
    # Deploy the contract
    tx_hash = w3.eth.send_transaction(constructor_txn)
    
    # Wait for the transaction to be mined
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    if tx_receipt.status == 0:  # Contract deployment failed
        raise Exception("Contract deployment failed")
        
    return tx_receipt.contractAddress

# Let AI generate a name for the token
messages = [
    SystemMessage(content="Generate a creative and funny name for a meme token. Respond with just the name and symbol in format: NAME|SYMBOL"),
    HumanMessage(content="Create a name and symbol for a new meme token"),
]

response = model.invoke(messages)
token_name, token_symbol = response.content.split('|')

# Deploy contract
contract_address = deploy_meme_contract(token_name.strip(), token_symbol.strip())
print(f"Deployed MEME token at: {contract_address}")
print(f"Token Name: {token_name}")
print(f"Token Symbol: {token_symbol}")