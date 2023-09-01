pragma solidity ^0.5.0;

contract VdfService {
    address owner;
    address public cbAddress;     

    modifier onlyOwner {
        require(owner == msg.sender);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    event EvaluateVdfQuery(uint id, string challenge, uint difficult); 
    event VerifyVdfQuery(uint id, string challenge, uint difficult, string proof);  

    function evaluate(string memory challenge, uint difficult) public returns(uint) {
        uint id = uint(sha256(abi.encodePacked(challenge, difficult)));
        emit EvaluateVdfQuery(id, challenge, difficult);
        return id;
    }

    function verify(string memory challenge, uint difficult, string memory proof) public returns(uint) {
        uint id = uint(sha256(abi.encodePacked(challenge, difficult, proof)));
        emit VerifyVdfQuery(id, challenge, difficult, proof);
        return id;
    }

    function setCbAddress(address _cbAddress) public onlyOwner {
        cbAddress = _cbAddress;
    }

}