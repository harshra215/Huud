// src/blockchain/client/fabricClient.js

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const channelName = 'mychannel';  // Channel name
const chaincodeName = 'patientChaincode';  // Chaincode name (adjust for patient or consent)
const networkConfigPath = path.resolve(__dirname, '../../config/blockchainConfig.json');  // Path to the blockchain configuration

// Function to setup the Fabric Gateway
async function setupGateway() {
    const wallet = await setupWallet();
    const gateway = new Gateway();

    // Read connection profile from networkConfig
    const connectionProfile = JSON.parse(fs.readFileSync(networkConfigPath, 'utf8'));

    // Setup Gateway with the connection profile and wallet
    await gateway.connect(connectionProfile, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
    return gateway;
}

// Setup wallet to store identities
async function setupWallet() {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    const exists = await wallet.exists('admin');
    if (!exists) {
        console.log('Admin identity not found in wallet. Please enroll the admin first.');
        process.exit(1);
    }
    return wallet;
}

// Function to invoke the chaincode (write to the ledger)
async function invokeChaincode(functionName, ...args) {
    try {
        const gateway = await setupGateway();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // Invoke chaincode function (e.g., create or update patient/consent record)
        await contract.submitTransaction(functionName, ...args);
        console.log(`Transaction '${functionName}' has been submitted`);

        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to invoke transaction: ${error}`);
        process.exit(1);
    }
}

// Function to query the chaincode (read from the ledger)
async function queryChaincode(functionName, ...args) {
    try {
        const gateway = await setupGateway();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // Query chaincode function (e.g., get patient/consent record)
        const result = await contract.evaluateTransaction(functionName, ...args);
        console.log(`Transaction '${functionName}' has been evaluated. Result: ${result.toString()}`);

        await gateway.disconnect();
        return result.toString();
    } catch (error) {
        console.error(`Failed to query transaction: ${error}`);
        process.exit(1);
    }
}

// Example of how to use this client code to interact with the chaincode
async function createPatientRecord(patientId, patientData) {
    await invokeChaincode('createPatientRecord', patientId, patientData);
}

async function getPatientRecord(patientId) {
    const result = await queryChaincode('getPatientRecord', patientId);
    console.log(`Patient record: ${result}`);
}

async function createConsent(patientId, healthcareProviderId, consentGiven) {
    await invokeChaincode('createConsent', patientId, healthcareProviderId, consentGiven);
}

async function getConsent(patientId, healthcareProviderId) {
    const result = await queryChaincode('getConsent', patientId, healthcareProviderId);
    console.log(`Consent record: ${result}`);
}

// Example usage
(async () => {
    // Create a patient record
    await createPatientRecord('12345', 'Patient data for 12345');

    // Query the patient record
    await getPatientRecord('12345');

    // Create a consent record
    await createConsent('12345', 'provider1', 'true');

    // Query the consent record
    await getConsent('12345', 'provider1');
})();
// Placeholder for fabricClient.js
