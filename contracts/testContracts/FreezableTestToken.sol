pragma solidity ^0.4.25;

import "electusvoting/contracts/Token/FreezableToken.sol";

contract FreezableTestToken is FreezableToken {
    constructor() public {
        totalMintableSupply = 100;
        mint(msg.sender, 100);
    }
}
