// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract MainEAFIT {
    IERC20 public token;
    address public owner;
    address public ownerWithdrawal;
    mapping (string => uint256) public transfers;
    mapping (string => string) public signatures;

    constructor(address _token, address _owner, address _ownerWithdrawal) {
        token = IERC20(_token);
        owner = _owner;
        ownerWithdrawal = _ownerWithdrawal;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyOwnerWithdrawal() {
        require(msg.sender == ownerWithdrawal, "Only ownerWithdrawal");
        _;
    }
    
    function deposit(
        address _sender,
        uint256 _amount,
        string calldata _idTrx,
        string calldata _signature
    ) external onlyOwner {
        bool transferSuccess = token.transferFrom(
            _sender,
            address(this),
            _amount
        );
        require(transferSuccess, "Transfer to contract failed");
        transfers[_idTrx] = _amount;
        signatures[_idTrx] = _signature;
    }

    function withdrawal (address _receiver, uint256 _amount) public onlyOwnerWithdrawal {
        bool transferSuccess = token.transfer(_receiver, _amount);
        require(transferSuccess, "Transfer to user failed");
    }
}