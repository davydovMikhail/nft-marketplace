//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    using SafeERC20 for IERC20;
    address private _address721;
    address private _address20;

    mapping(uint256 => Deal) private _sales;
    mapping(uint256 => Deal) private _auctions;

    struct Deal {
        address seller;
        uint256 price;
        bool active;
    }

    // struct Auction {
    //     uint256 startTime;
    //     uint256 bidderCounter;
    //     address lastBidder;
    // }

    constructor(address address721_, address address20_) {
        _address721 = address721_;
        _address20 = address20_;
    }

    function createItem(string calldata _tokenURI, address _owner)
        public
        onlyOwner
    {
        IERC721(_address721).mint(_owner, _tokenURI);
    }

    function listItem(uint256 _tokenId, uint256 _price) public {
        IERC721(_address721).transferFrom(msg.sender, address(this), _tokenId);
        _sales[_tokenId] = Deal(msg.sender, _price, true);
    }

    function cancel(uint256 _tokenId) public {
        IERC721(_address721).transferFrom(address(this), msg.sender, _tokenId);
        _sales[_tokenId].active = false;
    }

    function buyItem(uint256 _tokenId) public {
        require(_sales[_tokenId].active, "deal no longer valid");
        IERC20(_address20).transferFrom(
            msg.sender,
            _sales[_tokenId].seller,
            _sales[_tokenId].price
        );
        IERC721(_address721).transferFrom(address(this), msg.sender, _tokenId);
        _sales[_tokenId].active = false;
    }
}
