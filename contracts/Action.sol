pragma solidity ^0.4.24;

import "./IAction.sol";


contract Action is IAction {
    function execute() external;

    function canExecute() external view returns (uint) {
        uint returnValue = 1;
        return returnValue;
    }    
}