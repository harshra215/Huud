// Placeholder for consentController.js
// src/api/controllers/consentController.js

const Consent = require('../models/consent'); // MongoDB model for consent
const Patient = require('../models/patient'); // MongoDB model for patient records
const jwt = require('jsonwebtoken');
const { encryptConsentData, decryptConsentData } = require('../utils/encryption');
const blockchainClient = require('../../blockchain/client/fabricClient');

// Create a new consent record
exports.createConsent = async (req, res) => {
    try {
        const { patientId, healthcareProviderId, consentGiven } = req.body;

        // Verify that the user is authorized to give consent
        const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
        if (decodedToken.userId !== healthcareProviderId) {
            return res.status(403).json({ message: 'Not authorized to give consent for this patient' });
        }

        // Encrypt consent data
        const encryptedConsent = encryptConsentData(consentGiven);

        // Save the consent in the database (MongoDB in this case)
        const consent = new Consent({
            patientId,
            healthcareProviderId,
            consentGiven: encryptedConsent
        });

        await consent.save();

        // Record the consent on the blockchain (Hyperledger Fabric interaction)
        await blockchainClient.invokeConsentChaincode(patientId, healthcareProviderId, encryptedConsent);

        res.status(201).json({ message: 'Consent created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating consent', error });
    }
};

// Get consent details for a patient (Decrypt consent data)
exports.getConsent = async (req, res) => {
    try {
        const { patientId, healthcareProviderId } = req.params;

        // Fetch consent from database
        const consent = await Consent.findOne({ patientId, healthcareProviderId });
        if (!consent) {
            return res.status(404).json({ message: 'Consent not found' });
        }

        // Decrypt consent data
        const decryptedConsent = decryptConsentData(consent.consentGiven);

        res.status(200).json({
            patientId: consent.patientId,
            healthcareProviderId: consent.healthcareProviderId,
            consentGiven: decryptedConsent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving consent', error });
    }
};

// Update consent (change consent status)
exports.updateConsent = async (req, res) => {
    try {
        const { patientId, healthcareProviderId } = req.params;
        const { consentGiven } = req.body;

        // Encrypt consent data
        const encryptedConsent = encryptConsentData(consentGiven);

        // Update consent in the database
        const consent = await Consent.findOneAndUpdate(
            { patientId, healthcareProviderId },
            { consentGiven: encryptedConsent },
            { new: true }
        );

        if (!consent) {
            return res.status(404).json({ message: 'Consent not found for update' });
        }

        // Update blockchain with the new consent data
        await blockchainClient.invokeConsentChaincode(patientId, healthcareProviderId, encryptedConsent);

        res.status(200).json({ message: 'Consent updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating consent', error });
    }
};
