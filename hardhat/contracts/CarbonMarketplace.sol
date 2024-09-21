// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CarbonToken.sol";

contract CarbonMarketplace is CarbonToken {
    struct Listing {
        uint256 amount; // Number of tokens to sell
        uint256 price;  // Price per token in wei
        bool active;    // Is the listing active or not
    }

    mapping(address => Listing) public listings;
    address[] public sellers;

    event TokensListed(address indexed seller, uint256 amount, uint256 price);
    event ListingUpdated(address indexed seller, uint256 newAmount, uint256 newPrice);
    event TokensPurchased(address indexed buyer, address indexed seller, uint256 amount, uint256 totalPrice);

    // Function to list tokens for sale
    function listTokens(uint256 amount, uint256 price) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(amount > 0 && price > 0, "Amount and price must be greater than zero");

        // If it's the user's first listing, add them to the seller's array
        if (!listings[msg.sender].active) {
            sellers.push(msg.sender);
        }

        listings[msg.sender] = Listing({
            amount: amount,
            price: price,
            active: true
        });

        emit TokensListed(msg.sender, amount, price);
    }

    // Function to update a token listing
    function updateListing(uint256 newAmount, uint256 newPrice) external {
        require(listings[msg.sender].active, "You do not have an active listing");
        require(balanceOf(msg.sender) >= newAmount, "Insufficient token balance");
        require(newAmount > 0 && newPrice > 0, "Amount and price must be greater than zero");

        listings[msg.sender].amount = newAmount;
        listings[msg.sender].price = newPrice;

        emit ListingUpdated(msg.sender, newAmount, newPrice);
    }

    // Function to calculate the average price of a single token across all active listings
    function calculateAveragePrice() public view returns (uint256) {
        uint256 totalTokens = 0;
        uint256 totalValue = 0;

        for (uint256 i = 0; i < sellers.length; i++) {
            address seller = sellers[i];
            if (listings[seller].active) {
                totalTokens += listings[seller].amount;
                totalValue += listings[seller].amount * listings[seller].price;
            }
        }

        require(totalTokens > 0, "No tokens listed for sale");

        return totalValue / totalTokens; // Average price per token
    }

    // Function to buy tokens from a seller
    function buyTokens(address seller, uint256 amount) external payable {
        require(listings[seller].active, "Seller does not have an active listing");
        require(listings[seller].amount >= amount, "Not enough tokens listed");
        uint256 totalPrice = listings[seller].price * amount;
        require(msg.value == totalPrice, "Incorrect ETH amount sent");

        // Transfer tokens to the buyer
        _transfer(seller, msg.sender, amount);

        // Update seller's listing
        listings[seller].amount -= amount;
        if (listings[seller].amount == 0) {
            listings[seller].active = false;  // Deactivate listing if all tokens are sold
        }

        // Transfer ETH to the seller
        payable(seller).transfer(msg.value);

        emit TokensPurchased(msg.sender, seller, amount, totalPrice);
    }

    // Function to view a seller's active listing
    function viewListing(address seller) external view returns (Listing memory) {
        return listings[seller];
    }

    // Function to get the number of active sellers
    function getNumberOfSellers() external view returns (uint256) {
        return sellers.length;
    }

    // New function to view all active listings with wallet, amount, and price
    function getAllListings() external view returns (address[] memory, uint256[] memory, uint256[] memory) {
        uint256 activeListings = 0;

        // First, count how many active listings there are
        for (uint256 i = 0; i < sellers.length; i++) {
            if (listings[sellers[i]].active) {
                activeListings++;
            }
        }

        // Create arrays to store the listing details
        address[] memory walletAddresses = new address[](activeListings);
        uint256[] memory amounts = new uint256[](activeListings);
        uint256[] memory prices = new uint256[](activeListings);

        // Fill the arrays with data from active listings
        uint256 index = 0;
        for (uint256 i = 0; i < sellers.length; i++) {
            if (listings[sellers[i]].active) {
                walletAddresses[index] = sellers[i];
                amounts[index] = listings[sellers[i]].amount;
                prices[index] = listings[sellers[i]].price;
                index++;
            }
        }

        return (walletAddresses, amounts, prices);
    }
}
