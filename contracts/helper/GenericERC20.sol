// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GenericERC20 is ERC20, Ownable {

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {}

    function mint(address recipient, uint256 amount) external onlyOwner {
        require(amount != 0, "amount == 0");
        _mint(recipient, amount);
    }

    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }
}