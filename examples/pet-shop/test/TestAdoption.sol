pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
    Adoption adoption = Adoption(DeployedAddresses.Adoption());

    function testUserCanAdoptPet() public {
        uint returnId = adoption.adopt(8);
        uint expected = 8;
        Assert.equal(returnId, expected, "Adoption of pet ID 8 should be recorded");
    }

    function testGetAdopterAddressByPetId() public {
        // 期望的8号宠物所有者是这个合约
        address expected = address(this);
        address adopter = adoption.adopters(8);
        Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded");
    }

    // 测试查询所有宠物的所有者
    function testGetAdopterAddressByPetIdInArray() public {
        address expected = address(this);
        address[16] memory adopters = adoption.getAdopters();
        Assert.equal(expected, adopters[8], "Owner of pet ID 8 should be recorded");
    }
}