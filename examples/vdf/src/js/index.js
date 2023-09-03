const fs = require('fs');
const Web3 = require('web3');
const shell = require("shelljs");
const solc =  require('solc')

// config
const ETHEREUM_URL = "ws://localhost:7545";
const ACCOUNT_ADDRESS = '0xf11f2c5d5d2f790061b40033c4f1a2ad9f306d09';
const VDF_SERVICE_ADDRESS = '0xfbe68134880e3b2cf404cc3dcb0851e01f44b2e3';
const DICE_ADDRESS = '0xbe4ab15d2f17074567adba4c964e9d48fd4ba644';
const EVALUATE_QUERY_DEFINITION = "EvaluateVdfQuery(uint256,string,uint256)";
const VERIFY_QUERY_DEFINITION = "VerifyVdfQuery(uint256,string,uint256,string)";


// Connect to node
var web3 = new Web3(Web3.givenProvider || ETHEREUM_URL);
web3.eth.defaultAccount = web3.utils.toChecksumAddress(ACCOUNT_ADDRESS);
// web3.eth.defaultAccount = web3.utils.toChecksumAddress(web3.eth.getAccounts(function(accounts){return accounts[0]}));
console.log(`connected to ethereum node at ${ETHEREUM_URL} with account: ${web3.eth.defaultAccount}`);

// Parse config
const evalVdfQueryEventTopic = web3.utils.keccak256(EVALUATE_QUERY_DEFINITION);
const verifyVdfQueryEventTopic = web3.utils.keccak256(VERIFY_QUERY_DEFINITION);
const vdfServiceAddr = web3.utils.toChecksumAddress(VDF_SERVICE_ADDRESS);
const diceAddr = web3.utils.toChecksumAddress(DICE_ADDRESS);

// Get contract info
let vdfService = _compileContract('VdfService', vdfServiceAddr);
let dice = _compileContract('Dice', diceAddr);

console.log('watch for VDF query...');
// Subscribe EvaluateVdfQuery watcher
web3.eth.subscribe('logs', {address: vdfServiceAddr, topics: [evalVdfQueryEventTopic]})
    .on('data', function(event) { 
        console.log("get an EvaluateVdfQuery...");
        console.log(event);
        var args = web3.eth.abi.decodeParameters(['uint256', 'string', 'uint256'], event.data);
        var id = args[0];
        var challenge = args[1];
        var difficult = args[2];

        // using https://github.com/poanetwork/vdf to evaluate target VDF
        cmdStr = `vdf-cli ${challenge} ${difficult}`;
        console.log(`evaluate the VDF: 
        {
            id: ${id},
            challenge: ${challenge},
            difficult, ${difficult}
        }`);
        var proof = shell.exec(cmdStr, {silent: true}).replace("\n", '');

        // must to unlock the cbAddress before firing
        // web3.personal.unlockAccount(web3.eth.defaultAccount, password);
        console.log(`fire back by calling _evaluateCallback(${id}, ${proof})`);
        let txid = dice.instance.methods._evaluateCallback(id, proof).send({from: web3.eth.defaultAccount, gas: 3000000}).then(function(receipt){
            // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
            console.log(receipt);
            let result = dice.instance.methods.checkResult().call(console.log);
        });

        console.log('----------------------------------------------------------------');
    })
    .on('changed', function(event) {
        // TODO: remove event from local database
        console.log("TODO: remove event from local database");
    })
    .on('error', console.error);

// subscribe VerifyVdfQuery watcher
web3.eth.subscribe('logs', {address: vdfServiceAddr, topics: [verifyVdfQueryEventTopic]})
    .on('data', function(event) {
        console.log("get an VerifyVdfQuery...");
        console.log(event);
        var args = web3.eth.abi.decodeParameters(['uint256', 'string', 'uint256', 'string'], event.data);
        var id = args[0];
        var challenge = args[1];
        var difficult = args[2];
        var proof = args[3];

        // using https://github.com/poanetwork/vdf to evaluate target VDF
        cmdStr = `vdf-cli ${challenge} ${difficult} ${proof}`;
        console.log(`verify the VDF: 
        {
            id: ${id},
            challenge: ${challenge},
            difficult, ${difficult},
            proof: ${proof}
        }`);
        var verify_output = shell.exec(cmdStr, {silent: true}).replace("\n", '');
        var result;
        if (verify_output === "Proof is valid") {
            result = true;
        } else {
            result = false;
        }

        // must to unlock the cbAddress before firing
        // web3.personal.unlockAccount(web3.eth.defaultAccount, password);
        console.log(`fire back by calling _verifyCallback(${id}, ${result})`);
        let txid = dice.instance.methods._verifyCallback(id, result).send({from: web3.eth.defaultAccount, gas: 30000000}).then(function(receipt) {
            // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
            console.log(receipt);
        });

        console.log('----------------------------------------------------------------');
    })
    .on('changed', function(event) {
        // TODO: remove event from local database
        console.log("TODO: remove event from local database");
    })
    .on('error', console.error);


/**
 * Compile contract to get necessary information.
 * @param {string} name Contract name.
 * @param {string} address Address of deployed contract.
 */
function _compileContract(name, address) {
    // 读取合约内容
    let fileName = name + ".sol"
    let contractSource = fs.readFileSync("./contracts/" + fileName, 'utf-8');

    //预先定义好编译源json对象
    var _source = {};
    _source[fileName] = {content: contractSource};
    let jsonContractSource = JSON.stringify({
        language: 'Solidity',
        sources: _source,
        settings: { 
            outputSelection: { // 自定义编译输出的格式。以下选择输出全部结果。
                '*': {
                    '*': [ '*' ]
                }
            }
        },
    });

    // 编译合约源码得到结果
    let output = JSON.parse(solc.compile(jsonContractSource, findImports));

    console.log(output);

    let constractJson = {
        'abi': {},
        'bytecode': ''
    };
    
    // output 为json对象，根据json结构保存对应的abi和bytecode
    for (var contractName in output.contracts[fileName]) {
        constractJson.abi = output.contracts[fileName][contractName].abi;
        constractJson.bytecode = output.contracts[fileName][contractName].evm.bytecode.object;
    }

    // 将Json数据输出到json文件
    fs.writeFile(name+".json", JSON.stringify(constractJson), function(err){
        if(err) 
        console.error(err);
        console.log(`${name}.sol compiled sucessfully.`);
    })

    var contractInstance = new web3.eth.Contract(constractJson.abi, address);

    return {
        'abi': constractJson.abi,
        'instance': contractInstance
    };
}

/**
 * The path to find import *.sol.
 * @param {string} path 
 */
function findImports (path) {
    if (path === 'VdfService.sol')
        return {contents: fs.readFileSync("./contracts/VdfService.sol", 'utf-8')}
    else if (path === 'VdfResolver.sol')
        return {contents: fs.readFileSync("./contracts/VdfResolver.sol", 'utf-8')}
    else if (path === 'UsingVdfService.sol')
        return {contents: fs.readFileSync("./contracts/UsingVdfService.sol", 'utf-8')}
    else
        return { error: 'File not found' }
}

/**
 * Generate a random number between low and high.
 * @param {number} low 
 * @param {number} high 
 */
function _randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

(function wait() {
    setTimeout(wait, 1000);
})();
