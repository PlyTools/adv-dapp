var VdfService = artifacts.require("./VdfService.sol");
var VdfResolver = artifacts.require("./VdfResolver.sol");

module.exports = function(deployer) {
  deployer.deploy(VdfService);
  deployer.deploy(VdfResolver);
};
