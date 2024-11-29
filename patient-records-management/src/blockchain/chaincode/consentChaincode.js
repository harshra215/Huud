// src/blockchain/chaincode/consentChaincode.mjs

import { Contract } from 'fabric-contract-api';

class ConsentChaincode extends Contract {

    // Initialize the chaincode
    async initLedger(ctx) {
        console.info('Initialized the Ledger');
    }

    // Create a new consent record (write)
    async createConsentRecord(ctx, consentId, patientId, providerId, consentData) {
        console.info(`Creating consent record with ID: ${consentId}`);

        // Check if the consent already exists
        const existingConsent = await this.getConsentRecord(ctx, consentId);
        if (existingConsent && existingConsent.length > 0) {
            throw new Error(`Consent with ID ${consentId} already exists.`);
        }

        // Create a new consent record
        const consentRecord = {
            consentId,
            patientId,
            providerId,
            consentData,
            docType: 'consent',
        };

        // Save to the ledger (state database)
        await ctx.stub.putState(consentId, Buffer.from(JSON.stringify(consentRecord)));

        console.info(`Consent record ${consentId} created successfully.`);
    }

    // Retrieve a consent record (read)
    async getConsentRecord(ctx, consentId) {
        console.info(`Fetching consent record with ID: ${consentId}`);

        const consentRecordBytes = await ctx.stub.getState(consentId);
        if (!consentRecordBytes || consentRecordBytes.length === 0) {
            throw new Error(`Consent with ID ${consentId} not found.`);
        }

        console.info(`Consent record found: ${consentRecordBytes.toString()}`);
        return JSON.parse(consentRecordBytes.toString());
    }

    // Update a consent record (write)
    async updateConsentRecord(ctx, consentId, newConsentData) {
        console.info(`Updating consent record with ID: ${consentId}`);

        const consentRecord = await this.getConsentRecord(ctx, consentId);

        // Update the consent data
        consentRecord.consentData = newConsentData;

        // Save the updated record back to the ledger
        await ctx.stub.putState(consentId, Buffer.from(JSON.stringify(consentRecord)));

        console.info(`Consent record ${consentId} updated successfully.`);
    }

    // Delete a consent record (write)
    async deleteConsentRecord(ctx, consentId) {
        console.info(`Deleting consent record with ID: ${consentId}`);

        // Check if the consent exists before deleting
        const consentRecord = await this.getConsentRecord(ctx, consentId);
        if (!consentRecord) {
            throw new Error(`Consent with ID ${consentId} does not exist.`);
        }

        // Delete the consent record from the ledger
        await ctx.stub.deleteState(consentId);

        console.info(`Consent record ${consentId} deleted successfully.`);
    }
}

export default ConsentChaincode;
