pragma solidity ^0.5.0;

import "./VdfService.sol";
import "./VdfResolver.sol";

contract UsingVdfService {
    struct Vdf {
        uint id;
        string challenge;
        uint difficult;
        string proof;
        bool valid;
    }
    
    mapping (uint=>Vdf) public vdfs;   // 所有生成的VDF

    
    VdfResolver public resolver;
    VdfService public service;
    
    modifier myVdfAPI {
        // 指定VdfResolver的合約地址
        resolver = VdfResolver(0x4fB324D62E79488B4700C5CC7329c13A91076D4C);
        service = VdfService(resolver.getVdfServiceAddress());
        _;
    }

    modifier onlyFromCbAddress {
        require(msg.sender == service.cbAddress());
        _;
    }
    
    function evaluate(string memory challenge, uint difficult) public myVdfAPI returns(uint vdf_id) {
        return service.evaluate(challenge, difficult);
    }

    function verify(string memory challenge, uint difficult, string memory proof) public myVdfAPI returns(uint) {
        return service.verify(challenge, difficult, proof);
    }

    // 链下的VDF服务通过此回调将Vdf请求的计算结果传回
    function _evaluateCallback(uint _id, string memory proof) public onlyFromCbAddress returns(bool) {
        return false;
    }

    // 链下的VDF服务通过此回调将Vdf请求的计算结果传回
    function _verifyCallback(uint _id, bool result) public onlyFromCbAddress {
        
    }
}
