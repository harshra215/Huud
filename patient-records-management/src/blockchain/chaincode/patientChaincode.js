// src/blockchain/chaincode/patientChaincode.mjs

import { Contract } from 'fabric-contract-api';

class PatientChaincode extends Contract {

    // Initialize the chaincode
    async initLedger(ctx) {
        console.info('Initialized the Ledger');
    }

    // Create a new patient record (write)
    async createPatientRecord(ctx, patientId, patientData) {
        console.info(`Creating patient record with ID: ${patientId}`);

        // Check if the patient already exists
        const existingPatient = await this.getPatientRecord(ctx, patientId);
        if (existingPatient && existingPatient.length > 0) {
            throw new Error(`Patient with ID ${patientId} already exists.`);
        }

        // Create a new patient record
        const patientRecord = {
            patientId,
            patientData,
            docType: 'patient',
        };

        // Save to the ledger (state database)
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patientRecord)));

        console.info(`Patient record ${patientId} created successfully.`);
    }

    // Retrieve a patient record (read)
    async getPatientRecord(ctx, patientId) {
        console.info(`Fetching patient record with ID: ${patientId}`);

        const patientRecordBytes = await ctx.stub.getState(patientId);
        if (!patientRecordBytes || patientRecordBytes.length === 0) {
            throw new Error(`Patient with ID ${patientId} not found.`);
        }

        console.info(`Patient record found: ${patientRecordBytes.toString()}`);
        return JSON.parse(patientRecordBytes.toString());
    }

    // Update a patient record (write)
    async updatePatientRecord(ctx, patientId, newPatientData) {
        console.info(`Updating patient record with ID: ${patientId}`);

        const patientRecord = await this.getPatientRecord(ctx, patientId);

        // Update the patient data
        patientRecord.patientData = newPatientData;

        // Save the updated record back to the ledger
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patientRecord)));

        console.info(`Patient record ${patientId} updated successfully.`);
    }

    // Delete a patient record (write)
    async deletePatientRecord(ctx, patientId) {
        console.info(`Deleting patient record with ID: ${patientId}`);

        // Check if the patient exists before deleting
        const patientRecord = await this.getPatientRecord(ctx, patientId);
        if (!patientRecord) {
            throw new Error(`Patient with ID ${patientId} does not exist.`);
        }

        // Delete the patient record from the ledger
        await ctx.stub.deleteState(patientId);

        console.info(`Patient record ${patientId} deleted successfully.`);
    }
}

export default PatientChaincode;
