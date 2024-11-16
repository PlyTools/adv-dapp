pragma solidity ^0.5.0;

contract VdfResolver {
    address owner;
    address vdfServiceAddress;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(owner == msg.sender);
        _;
    }

    function setVdfServiceAddress(address _addr) public onlyOwner {
        vdfServiceAddress = _addr;
    }
    
    function getVdfServiceAddress() public view returns(address) {
        return vdfServiceAddress;
    }
}