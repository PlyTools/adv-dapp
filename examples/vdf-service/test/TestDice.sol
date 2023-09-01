pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Dice.sol";

contract TestDice {
    Dice dice = Dice(DeployedAddresses.Dice());

    // 测试查询投骰子是不是正常工作
    function testDice() public {
        dice.dice();
        assert(true);
    }
}