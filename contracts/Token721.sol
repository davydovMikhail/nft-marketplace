// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Token721 is ERC721, ERC721URIStorage {
    uint256 private _counter = 1;
    address private _owner;
    address private _marketplace;

    modifier onlyOwner() {
        require(
            msg.sender == _owner,
            "this feature is only available to the owner of the contract"
        );
        _;
    }

    modifier onlyMarketplace() {
        require(
            msg.sender == _marketplace,
            "this function is available only to the address of the marketplace"
        );
        _;
    }

    constructor() ERC721("Contract For Marketplace", "CFM") {
        _owner = msg.sender;
    }

    function setNewMarketplaceAddress(address _address) public onlyOwner {
        _marketplace = _address;
    }

    function mint(address _to, string calldata _uri) external onlyMarketplace {
        _safeMint(_to, _counter);
        _setTokenURI(_counter, _uri);
        _counter += 1;
    }

    function _burn(uint256 _tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(_tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(_tokenId);
    }
}
