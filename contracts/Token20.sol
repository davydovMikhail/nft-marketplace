//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Token20 {
    string public constant name = "Training Test Token";
    string public constant symbol = "TTTDMS";
    uint8 public constant decimals = 18;
    address private _owner;
    uint256 private _totalSupply;

    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    constructor(uint256 _total) {
        _totalSupply = _total;
        _balances[msg.sender] = _total;
        _owner = msg.sender;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    modifier onlyOwner() {
        require(
            msg.sender == _owner,
            "this feature is only available to the owner of the contract"
        );
        _;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _account) external view returns (uint256) {
        return _balances[_account];
    }

    function transfer(address _to, uint256 _amount) external returns (bool) {
        require(
            _balances[msg.sender] >= _amount,
            "transfer amount must be equal or less than your balance"
        );
        _balances[msg.sender] -= _amount;
        _balances[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function allowance(address _from, address _to)
        external
        view
        returns (uint256)
    {
        return _allowances[_from][_to];
    }

    function approve(address _to, uint256 _amount) public returns (bool) {
        _allowances[msg.sender][_to] = _amount;
        emit Approval(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) external returns (bool) {
        uint256 currentAllowance = _allowances[_from][msg.sender];
        require(
            currentAllowance >= _amount,
            "transferred amount exceeds the allowed"
        );
        _balances[_from] -= _amount;
        _balances[_to] += _amount;
        _allowances[_from][msg.sender] = currentAllowance - _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function increaseAllowance(address _to, uint256 _addedAmount)
        external
        returns (bool)
    {
        approve(_to, _allowances[msg.sender][_to] + _addedAmount);
        return true;
    }

    function decreaseAllowance(address _to, uint256 _subtractedAmount)
        external
        returns (bool)
    {
        uint256 currentAllowance = _allowances[msg.sender][_to];
        require(
            currentAllowance >= _subtractedAmount,
            "the subtracted value must be less than the current Allowance"
        );
        approve(_to, currentAllowance - _subtractedAmount);
        return true;
    }

    function mint(address _address, uint256 _amount)
        external
        onlyOwner
        returns (bool)
    {
        _balances[_address] += _amount;
        _totalSupply += _amount;
        return true;
    }

    function burn(address _address, uint256 _amount)
        external
        onlyOwner
        returns (bool)
    {
        require(
            _balances[_address] >= _amount,
            "the withdrawn amount must be less than the balance of the specified address"
        );
        _balances[_address] -= _amount;
        _totalSupply -= _amount;
        return true;
    }
}
