pragma solidity ^0.5.0;

import "./UsingVdfService.sol";

contract Dice is UsingVdfService {
    address owner;
    mapping(address => uint) myids;
    mapping(uint => string) dice_result;
    
    // 辅助用event
    event NewMyVdfQuery(string description);
    event DiceResult(string result);
    
    constructor() public {
        owner = msg.sender;
    }
    
    // 掷骰子
    function dice() public {
        uint myid = evaluate("abac", 100);
        myids[msg.sender] = myid;
        emit NewMyVdfQuery("The query of evaluating VDF was sent, standing by for the answer...");
    }
    
    // override
    function _evaluateCallback(uint _id, string memory proof) public onlyFromCbAddress returns(bool) {
        dice_result[_id] = proof;
        emit DiceResult(proof);
        return true;
    }
    
    function checkResult() public view returns (string memory) {
        return dice_result[myids[msg.sender]];
    }
}
