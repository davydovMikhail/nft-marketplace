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
    uint256 private threeDays = 259200;

    mapping(uint256 => Deal) private _sales;
    mapping(uint256 => Auction) private _auctions;

    struct Deal {
        address seller;
        uint256 price;
        bool active;
    }

    struct Auction {
        uint256 startTime;
        uint256 bidderCounter;
        address lastBidder;
        uint256 price;
        address seller;
    }

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
        require(
            _sales[_tokenId].seller == msg.sender,
            "the token does not belong to you"
        );
        IERC721(_address721).transferFrom(address(this), msg.sender, _tokenId);
        _sales[_tokenId].active = false;
    }

    function buyItem(uint256 _tokenId) public {
        require(_sales[_tokenId].active, "deal no longer valid");
        IERC20(_address20).safeTransferFrom(
            msg.sender,
            _sales[_tokenId].seller,
            _sales[_tokenId].price
        );
        IERC721(_address721).transferFrom(address(this), msg.sender, _tokenId);
        _sales[_tokenId].active = false;
    }

    // auction

    function listItemOnAuction(uint256 _tokenId, uint256 _startPrice) public {
        IERC721(_address721).transferFrom(msg.sender, address(this), _tokenId);
        _auctions[_tokenId] = Auction(
            block.timestamp,
            0,
            address(0),
            _startPrice,
            msg.sender
        );
    }

    function makeBid(uint256 _tokenId, uint256 _newPrice) public {
        require(
            _auctions[_tokenId].startTime + threeDays > block.timestamp,
            "auction time has passed"
        ); // проверка на актуальность аукциона
        require(
            _auctions[_tokenId].price < _newPrice,
            "your price is less than the current one"
        ); // проверка на то что новая цена больше предыдущей
        if (_auctions[_tokenId].bidderCounter > 0) {
            IERC20(_address20).safeTransfer( // отправка токенов предыдущему участнику, который сделал ставку
                _auctions[_tokenId].lastBidder,
                _auctions[_tokenId].price
            );
        }
        IERC20(_address20).safeTransferFrom( // перевод денего от нового участника торгов
            msg.sender,
            address(this),
            _newPrice
        );
        _auctions[_tokenId].bidderCounter += 1;
        _auctions[_tokenId].lastBidder = msg.sender;
        _auctions[_tokenId].price = _newPrice;
    }

    function finishAuction(uint256 _tokenId) public {
        require(
            _auctions[_tokenId].startTime + threeDays < block.timestamp,
            "the time for debriefing has not yet expired"
        );
        require(
            _auctions[_tokenId].seller != address(0),
            "the auction has ended before you"
        );
        if (_auctions[_tokenId].bidderCounter > 2) {
            IERC20(_address20).safeTransfer(
                _auctions[_tokenId].seller,
                _auctions[_tokenId].price
            );
            IERC721(_address721).transferFrom(
                address(this),
                _auctions[_tokenId].lastBidder,
                _tokenId
            );
        } else if (_auctions[_tokenId].bidderCounter == 0) {
            IERC721(_address721).transferFrom(
                address(this),
                _auctions[_tokenId].seller,
                _tokenId
            );
        } else {
            IERC20(_address20).safeTransfer(
                _auctions[_tokenId].lastBidder,
                _auctions[_tokenId].price
            );
            IERC721(_address721).transferFrom(
                address(this),
                _auctions[_tokenId].seller,
                _tokenId
            );
        }
        _auctions[_tokenId].seller = address(0);
    }
}
