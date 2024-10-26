// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {TokenFactory} from "../src/TokenFactory.sol";
import {Token} from "../src/Token.sol";
import {IUniswapV2Factory} from "@uniswap-v2-core-1.0.1/contracts/interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Router02} from "@uniswap-v2-periphery-1.1.0-beta.0/contracts/interfaces/IUniswapV2Router02.sol";
import {IUniswapV2Pair} from "@uniswap-v2-core-1.0.1/contracts/interfaces/IUniswapV2Pair.sol";

contract TokenFactoryTest is Test {
    TokenFactory public factory;
    address public UNISWAP_FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address public UNISWAP_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IUniswapV2Factory public uniswapFactory =
        IUniswapV2Factory(UNISWAP_FACTORY);
    IUniswapV2Router02 public uniswapRouter =
        IUniswapV2Router02(UNISWAP_ROUTER);

    function setUp() public {
        factory = new TokenFactory();
    }

    function test_createToken() public {
        string memory name = "My Token";
        string memory ticker = "MYT";
        string memory description = "My Token Description";
        string memory imageUrl = "https://mytoken.com/image.png";
        address tokenAddress = factory.createToken(
            name,
            ticker,
            description,
            imageUrl
        );
        Token token = Token(tokenAddress);
        (
            string memory _name,
            string memory _ticker,
            string memory _description,
            string memory _imageUrl,
            address _creatorAddress,
            address _tokenAddress
        ) = factory.tokenInfo(tokenAddress);

        assertEq(token.balanceOf(address(factory)), factory.INITIAL_MINT());
        assertEq(token.totalSupply(), factory.INITIAL_MINT());
        assertEq(_name, name);
        assertEq(_ticker, ticker);
        assertEq(_description, description);
        assertEq(_imageUrl, imageUrl);
        assertEq(_creatorAddress, address(this));
        assertEq(_tokenAddress, tokenAddress);
    }

    function test_calculateRequiredEth() public {
        string memory name = "My Token";
        string memory ticker = "MYT";
        string memory description = "My Token Description";
        string memory imageUrl = "https://mytoken.com/image.png";
        address tokenAddress = factory.createToken(
            name,
            ticker,
            description,
            imageUrl
        );
        uint maxBuyableAmount = factory.MAX_SUPPLY() - factory.INITIAL_MINT();
        uint funding = factory.calculateRequiredEth(
            tokenAddress,
            maxBuyableAmount
        );
        assertEq(funding, 30 ether);
    }

    function test_buyToken() public {
        string memory name = "My Token";
        string memory ticker = "MYT";
        string memory description = "My Token Description";
        string memory imageUrl = "https://mytoken.com/image.png";
        address tokenAddress = factory.createToken(
            name,
            ticker,
            description,
            imageUrl
        );
        Token token = Token(tokenAddress);
        // Buy Max Buyable Amount
        uint maxBuyableAmount = factory.MAX_SUPPLY() - factory.INITIAL_MINT();
        factory.buyToken{value: 30 ether}(tokenAddress, maxBuyableAmount);
        assertEq(
            factory.balances(tokenAddress, address(this)),
            maxBuyableAmount
        );
        assertEq(
            token.totalSupply(),
            factory.INITIAL_MINT() + maxBuyableAmount
        );
        // Pair has been created in Uniswap
        address pairAddress = uniswapFactory.getPair(
            tokenAddress,
            uniswapRouter.WETH()
        );
        assertNotEq(pairAddress, address(0));
        // Check if LP tokens are burned
        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        uint lpBalance = pair.balanceOf(address(this));
        assertEq(lpBalance, 0);
        assertNotEq(pair.balanceOf(address(0)), 0);
    }
}
