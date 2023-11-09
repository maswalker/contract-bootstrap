// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ABDKMath64x64 } from "abdk-libraries-solidity/ABDKMath64x64.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20, ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BoostPool is Ownable, ReentrancyGuard, ERC20 {
    using ABDKMath64x64 for int128;
    using SafeERC20 for IERC20;

    uint256 public constant MAX_BOOST = 25000;
    uint256 public constant BOOST_DENOMINATOR = 10000;
    uint256 public startTime;
    uint256 public maxIncentive;
    IERC20 public token;

    event Deposit(address sender, uint256 amount);
    event Withdraw(address sender, uint256 amount);

    constructor(
        address token_,
        uint256 maxIncentive_
    ) ERC20("BoostPool LP Token", "BPLP") Ownable(msg.sender) {
        token = IERC20(token_);
        maxIncentive = maxIncentive_;
        startTime = block.timestamp;
    }

    function transfer(address to, uint256 amount)
        public
        override
        returns (bool)
    {
        revert("BoostPool::transfer: Not support transfer");
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        revert("BoostPool::transferFrom: Not support transferFrom");
    }

    function getBoost(address account) external view returns (uint256) {
        int128 pow = ABDKMath64x64.fromUInt(6).sub(ABDKMath64x64.divu(balanceOf(account) * 10, maxIncentive));
        int128 ret = ABDKMath64x64.fromUInt(1)
            .add(ABDKMath64x64.exp(pow))
            .mul(ABDKMath64x64.fromUInt(MAX_BOOST - BOOST_DENOMINATOR))
            .add(ABDKMath64x64.fromUInt(BOOST_DENOMINATOR));
        return ABDKMath64x64.toUInt(ret);
    }

    function deposit(uint256 amount) external nonReentrant {
        uint256 beforeAmount =  token.balanceOf(address(this));
        token.safeTransferFrom(
            address(msg.sender),
            address(this),
            amount
        );
        uint256 realAmount = token.balanceOf(address(this)) - beforeAmount;
        _mint(msg.sender, realAmount);
        emit Deposit(msg.sender, realAmount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        _burn(msg.sender, amount);
        token.safeTransfer(address(msg.sender), amount);
        emit Withdraw(msg.sender, amount);
    }
}
