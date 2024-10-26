// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "./Token.sol";
import "@uniswap-v2-core-1.0.1/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap-v2-periphery-1.1.0-beta.0/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap-v2-core-1.0.1/contracts/interfaces/IUniswapV2Pair.sol";

contract TokenFactory {
    uint public constant DECIMALS = 10 ** 18;
    uint public constant MAX_SUPPLY = (10 ** 9) * DECIMALS;
    uint public constant INITIAL_MINT = (MAX_SUPPLY * 20) / 100;
    uint public constant k = 46875;
    uint public constant offset = 18750000000000000000000000000000;
    uint public constant SCALING_FACTOR = 10 ** 39;
    uint public constant FUNDING_GOAL = 30 ether;
    address public constant UNISWAP_FACTORY_ADDRESS =
        0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address public constant UNISWAP_ROUTER_ADDRESS =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    enum TokenState {
        ICO,
        TRADING
    }

    struct TokenInfo {
        string name;
        string ticker;
        string description;
        string imageUrl;
        address creatorAddress;
        address tokenAddress;
    }

    mapping(address => TokenInfo) public tokenInfo;
    mapping(address => TokenState) public tokenState;
    mapping(address => uint) public collateral;
    mapping(address => mapping(address => uint)) public balances;

    TokenInfo[] public tokens;
    uint public tokenCount;

    function createToken(
        string memory name,
        string memory ticker,
        string memory description,
        string memory imageUrl
    ) external returns (address) {
        Token token = new Token(name, ticker, INITIAL_MINT);
        tokenInfo[address(token)] = TokenInfo(
            name,
            ticker,
            description,
            imageUrl,
            msg.sender,
            address(token)
        );
        tokenState[address(token)] = TokenState.ICO;
        tokens.push(tokenInfo[address(token)]);
        tokenCount++;
        return address(token);
    }

    function buyToken(address tokenAddress, uint amount) external payable {
        require(
            tokenInfo[tokenAddress].tokenAddress != address(0),
            "Token does not exist"
        );
        require(tokenState[tokenAddress] == TokenState.ICO, "Token not in ICO");
        Token token = Token(tokenAddress);
        uint availableSupply = MAX_SUPPLY - token.totalSupply();
        require(availableSupply >= amount, "Not enough supply");
        uint requiredEth = calculateRequiredEth(tokenAddress, amount);
        require(msg.value >= requiredEth, "Not enough eth");
        collateral[tokenAddress] += msg.value;
        balances[tokenAddress][msg.sender] += amount;
        token.mint(address(this), amount);

        if (collateral[tokenAddress] >= FUNDING_GOAL) {
            tokenState[tokenAddress] = TokenState.TRADING;
            //create liquidity pool
            address pairAddress = _createLiquidityPool(tokenAddress);
            //add liquidity
            uint liquidity = _addLiquidity(
                tokenAddress,
                token.balanceOf(address(this)),
                collateral[tokenAddress]
            );
            //burn lp tokens
            _burnLpTokens(pairAddress, liquidity);
            collateral[tokenAddress] = 0;
        }
    }

    function claimTokens(address tokenAddress) external {
        require(
            tokenState[tokenAddress] == TokenState.TRADING,
            "Token not in trading state"
        );
        Token token = Token(tokenAddress);
        uint amount = balances[tokenAddress][msg.sender];
        require(amount > 0, "No tokens to claim");
        balances[tokenAddress][msg.sender] = 0;
        token.transfer(msg.sender, amount);
    }

    function calculateRequiredEth(
        address tokenAddress,
        uint amount
    ) public view returns (uint) {
        // requiredEth = (b - a) * (f_a + f_b) / 2
        Token token = Token(tokenAddress);
        uint a = token.totalSupply() - INITIAL_MINT;
        uint b = a + amount;
        uint f_a = a * k + offset;
        uint f_b = b * k + offset;
        return ((b - a) * (f_a + f_b)) / (2 * SCALING_FACTOR);
    }

    function getAllTokens() external view returns (TokenInfo[] memory) {
        return tokens;
    }

    function getUserTokens(
        address User
    ) external view returns (TokenInfo[] memory) {
        TokenInfo[] memory userTokens;
        uint index = 0;
        for (uint i = 0; i < tokenCount; i++) {
            TokenInfo memory token = tokens[i];
            if (token.creatorAddress == User) {
                userTokens[index] = token;
                index++;
            }
        }
        return userTokens;
    }

    function _createLiquidityPool(
        address tokenAddress
    ) internal returns (address) {
        IUniswapV2Factory factory = IUniswapV2Factory(UNISWAP_FACTORY_ADDRESS);
        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        address pair = factory.createPair(tokenAddress, router.WETH());
        return pair;
    }

    function _addLiquidity(
        address tokenAddress,
        uint amountToken,
        uint amountEth
    ) internal returns (uint) {
        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        Token token = Token(tokenAddress);
        token.approve(UNISWAP_ROUTER_ADDRESS, amountToken);
        (uint _amountToken, uint _amountETH, uint liquidity) = router
            .addLiquidityETH{value: amountEth}(
            tokenAddress,
            amountToken,
            amountToken,
            amountEth,
            address(this),
            block.timestamp
        );
        return liquidity;
    }

    function _burnLpTokens(address pairAddress, uint amount) internal {
        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        pair.transfer(address(0), amount);
    }
}
