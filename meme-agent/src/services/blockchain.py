import os
from web3 import Web3
from solcx import compile_source, install_solc, get_installed_solc_versions, set_solc_version
from src.contracts.templates import MEME_TOKEN_TEMPLATE

class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
        self._setup_solc()

    def _setup_solc(self):
        SOLC_VERSION = '0.8.20'
        if SOLC_VERSION not in [str(v) for v in get_installed_solc_versions()]:
            install_solc(SOLC_VERSION)
        set_solc_version(SOLC_VERSION)

    def deploy_meme_contract(self, token_name: str, token_symbol: str) -> str:
        if not self.w3.is_connected():
            raise Exception("Not connected to Ethereum network")

        if len(self.w3.eth.accounts) == 0:
            raise Exception("No accounts found. Make sure Ganache is running")
        
        current_dir = "./"
        node_modules_path = os.path.join(current_dir, 'node_modules')
        
        if not os.path.exists(node_modules_path):
            raise Exception("node_modules directory not found. Please run 'npm install' first.")
        
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
        
        MemeToken = self.w3.eth.contract(
            abi=contract_interface['abi'],
            bytecode=contract_interface['bin']
        )
        
        account = self.w3.eth.accounts[0]
        
        constructor_txn = MemeToken.constructor(token_name, token_symbol).build_transaction({
            'from': account,
            'nonce': self.w3.eth.get_transaction_count(account),
            'gas': 5000000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        tx_hash = self.w3.eth.send_transaction(constructor_txn)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if tx_receipt.status == 0:
            raise Exception("Contract deployment failed")
            
        return tx_receipt.contractAddress 