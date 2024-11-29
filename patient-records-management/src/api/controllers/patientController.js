// src/api/controllers/patientController.js

const Patient = require('../models/patient'); // MongoDB model for patient
const { encryptPatientData, decryptPatientData } = require('../utils/encryption');
const blockchainClient = require('../../blockchain/client/fabricClient');

// Create a new patient record
exports.createPatient = async (req, res) => {
    try {
        const { name, dob, contactInfo } = req.body;

        // Encrypt patient data before storing
        const encryptedData = encryptPatientData({ name, dob, contactInfo });

        const patient = new Patient({
            name,
            dob,
            contactInfo: encryptedData
        });

        await patient.save();

        // Store patient record in the blockchain (Hyperledger Fabric)
        await blockchainClient.invokePatientChaincode(patient._id, encryptedData);

        res.status(201).json({ message: 'Patient created successfully', patientId: patient._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating patient record', error });
    }
};

// Get patient record
exports.getPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Decrypt patient data
        const decryptedData = decryptPatientData(patient.contactInfo);

        res.status(200).json({
            name: patient.name,
            dob: patient.dob,
            contactInfo: decryptedData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving patient record', error });
    }
};

// Update patient record
exports.updatePatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { name, dob, contactInfo } = req.body;

        // Encrypt updated patient data
        const encryptedData = encryptPatientData({ name, dob, contactInfo });

        const patient = await Patient.findByIdAndUpdate(
            patientId,
            { name, dob, contactInfo: encryptedData },
            { new: true }
        );

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found for update' });
        }

        // Update the patient record on blockchain
        await blockchainClient.invokePatientChaincode(patient._id, encryptedData);

        res.status(200).json({ message: 'Patient record updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating patient record', error });
    }
};
// Placeholder for patientController.js
