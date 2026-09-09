import "dotenv/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

/**
 * RELIEFCHAIN - Hardhat Configuration
 *
 * Stack:
 * - Hardhat 3
 * - Solidity 0.8.24
 * - Ethers.js
 * - OpenZeppelin
 * - Mocha
 * - dotenv
 */

const config = {
    // =========================================================
    // HARDHAT PLUGINS
    // =========================================================

    plugins: [
        hardhatToolboxMochaEthers
    ],


    // =========================================================
    // SOLIDITY COMPILER
    // =========================================================

    solidity: {
        version: "0.8.24",

        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },


    // =========================================================
    // TEST CONFIGURATION
    // =========================================================

    test: {
        mocha: {
            timeout: 40000
        }
    }
};


export default config;