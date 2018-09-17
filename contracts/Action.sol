pragma solidity ^0.4.24;

import "./IAction.sol";

contract Action is IAction {

    function canExecute() external view returns (uint) {
        uint returnValue = 1;
        return returnValue;
    }

    function execute() external {
        //do some action here
    }
}