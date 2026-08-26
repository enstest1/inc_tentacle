// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/// @title FeeOnTransferToken
/// @notice Takes 1% of every transfer. Unsupported in production (spec §14.8).
contract FeeOnTransferToken {
    string public constant name = "Fee On Transfer";
    string public constant symbol = "FOT";
    uint8 public constant decimals = 6;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "ALLOWANCE");
        allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(balanceOf[from] >= amount, "BALANCE");
        uint256 fee = amount / 100;
        uint256 sendAmount = amount - fee;
        balanceOf[from] -= amount;
        balanceOf[to] += sendAmount;
        // Fee is burned so totalSupply drops — Tentacle does not account for this.
        totalSupply -= fee;
        emit Transfer(from, to, sendAmount);
    }
}
