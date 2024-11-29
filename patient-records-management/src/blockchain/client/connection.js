// src/blockchain/client/connection.js

import { Gateway, FileSystemWallet, X509WalletMixin } from 'fabric-network';
import path from 'path';
import fs from 'fs';

// Constants for network details
const CHANNEL_NAME = 'mychannel';
const CHAINCODE_NAME = 'patientChaincode'; // Your chaincode name
const CCP_PATH = path.resolve(__dirname, '..', '..', '..', 'network', 'connection-profile.json'); // Connection profile path
const WALLET_PATH = path.resolve(__dirname, '..', '..', '..', 'wallet'); // Wallet path
const IDENTITY_NAME = 'user1'; // The identity name for the user

/**
 * Initialize the wallet and check if the required identity exists.
 * @returns {Promise<FileSystemWallet>} Returns a FileSystemWallet if identity exists.
 */
async function initializeWallet() {
    const wallet = new FileSystemWallet(WALLET_PATH);

    // Check if the identity exists in the wallet
    const identityExists = await wallet.exists(IDENTITY_NAME);
    if (!identityExists) {
        throw new Error(`Identity ${IDENTITY_NAME} not found in wallet.`);
    }

    return wallet;
}

/**
 * Connect to the Fabric gateway using the connection profile and wallet.
 * @param {FileSystemWallet} wallet - The wallet containing the identity.
 * @returns {Promise<Gateway>} Returns a Gateway object for interacting with the network.
 */
async function connectToFabricGateway(wallet) {
    const gateway = new Gateway();

    try {
        // Connect to the Fabric network using the connection profile
        await gateway.connect(CCP_PATH, {
            wallet: wallet,
            identity: IDENTITY_NAME,
            discovery: { enabled: true, asLocalhost: true }, // Enable discovery for local network
        });

        console.log('Successfully connected to the Fabric network.');
    } catch (error) {
        console.error('Failed to connect to the Fabric network:', error.message);
        throw new Error('Connection to Fabric network failed');
    }

    return gateway;
}

/**
 * Get the contract from the network to interact with the chaincode.
 * @param {Gateway} gateway - The Gateway object connected to the network.
 * @returns {Promise<Contract>} Returns a contract object for interacting with the chaincode.
 */
async function getContract(gateway) {
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);
    return contract;
}

/**
 * Setup connection to Fabric network and get the contract.
 * @returns {Promise<{gateway: Gateway, contract: Contract}>} Returns the gateway and contract for further use.
 */
async function setupFabricConnection() {
    try {
        // Initialize wallet and check for identity
        const wallet = await initializeWallet();

        // Connect to the Fabric gateway
        const gateway = await connectToFabricGateway(wallet);

        // Get the contract for interacting with chaincode
        const contract = await getContract(gateway);

        return { gateway, contract };
    } catch (error) {
        console.error('Error setting up Fabric connection:', error.message);
        throw new Error('Fabric connection setup failed');
    }
}

/**
 * Disconnect from the Fabric network gateway.
 * @param {Gateway} gateway - The Gateway object to disconnect.
 */
async function disconnectFromFabric(gateway) {
    try {
        gateway.disconnect();
        console.log('Disconnected from the Fabric network.');
    } catch (error) {
        console.error('Error during disconnection:', error.message);
    }
}

export {
    setupFabricConnection,
    disconnectFromFabric,
};
