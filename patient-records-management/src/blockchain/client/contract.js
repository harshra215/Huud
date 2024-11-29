// src/blockchain/client/contract.js

const { createGateway } = require('./connection');

// Define channel and chaincode details
const channelName = 'mychannel';  // Channel name
const patientChaincode = 'patientChaincode';  // Chaincode name (change it for the consent chaincode if needed)

// Function to invoke a chaincode (submit a transaction to modify the ledger)
async function invokeChaincode(chaincodeName, functionName, ...args) {
    try {
        const gateway = await createGateway();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // Submit the transaction to the ledger
        await contract.submitTransaction(functionName, ...args);
        console.log(`Transaction '${functionName}' has been submitted successfully!`);

        // Disconnect the gateway
        await gateway.disconnect();
    } catch (error) {
        console.error(`Error invoking chaincode: ${error}`);
        process.exit(1);
    }
}

// Function to query the chaincode (fetch data from the ledger)
async function queryChaincode(chaincodeName, functionName, ...args) {
    try {
        const gateway = await createGateway();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // Evaluate the transaction (query the ledger)
        const result = await contract.evaluateTransaction(functionName, ...args);
        console.log(`Transaction '${functionName}' has been evaluated. Result: ${result.toString()}`);

        // Disconnect the gateway
        await gateway.disconnect();
        return result.toString();
    } catch (error) {
        console.error(`Error querying chaincode: ${error}`);
        process.exit(1);
    }
}

// Example functions to create patient and consent records
async function createPatientRecord(patientId, patientData) {
    await invokeChaincode(patientChaincode, 'createPatientRecord', patientId, patientData);
}

async function getPatientRecord(patientId) {
    const result = await queryChaincode(patientChaincode, 'getPatientRecord', patientId);
    console.log(`Patient record: ${result}`);
}

async function createConsent(patientId, healthcareProviderId, consentGiven) {
    await invokeChaincode('consentChaincode', 'createConsent', patientId, healthcareProviderId, consentGiven);
}

async function getConsent(patientId, healthcareProviderId) {
    const result = await queryChaincode('consentChaincode', 'getConsent', patientId, healthcareProviderId);
    console.log(`Consent record: ${result}`);
}

module.exports = {
    createPatientRecord,
    getPatientRecord,
    createConsent,
    getConsent
};
