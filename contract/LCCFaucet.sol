// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract LCCFaucet {
    IERC20 public token;
    address public owner;

    uint256 public claimAmount = 10 * 10**18; // 10 LCC per claim
    uint256 public cooldown = 24 hours;

    mapping(address => uint256) public lastClaim;

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    // Claim LCC from faucet
    function claim() external {
        require(
            block.timestamp - lastClaim[msg.sender] >= cooldown,
            "Wait before claiming again"
        );
        require(
            token.balanceOf(address(this)) >= claimAmount,
            "Faucet empty"
        );

        lastClaim[msg.sender] = block.timestamp;
        token.transfer(msg.sender, claimAmount);
    }

    // Owner can refill faucet with LCC
    function refill(uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        token.transfer(address(this), amount);
    }
}
