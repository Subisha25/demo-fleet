import { Request, Response } from 'express';
import { Configuration } from '../models/configuration';
import { getTenantContext } from '../context/tenantContext';

// Create or update configuration
export const createConfiguration = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            serviceTaxPercentage,
            dueDays,
            invoiceNoStartingFrom,
            cancelBookingHours,
            invoiceNoPrefix,
            smtpServer,
            smtpEmailAddress,
            smtpEmailPassword,
            smtpEmailPort,
            outstationHasTax
        } = req.body;

        const requiredFields = [
            'serviceTaxPercentage',
            'dueDays',
            'invoiceNoStartingFrom',
            'cancelBookingHours',
            'invoiceNoPrefix',
            'smtpServer',
            'smtpEmailAddress',
            'smtpEmailPassword',
            'smtpEmailPort'
        ];

        const missingFields = requiredFields.filter(field => {
            const value = req.body[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields',
                missingFields
            });
            return;
        }

        const existingConfig = await Configuration.findOne();

        const ctx = getTenantContext();
        const isPlatformAdmin = ctx?.isPlatformSuperAdmin && !(req as any).headers?.['x-tenant-id'];

        let finalSmtpServer = smtpServer;
        let finalSmtpEmailAddress = smtpEmailAddress;
        let finalSmtpEmailPort = smtpEmailPort;
        let finalPassword = smtpEmailPassword;

        // If not platform admin, preserve existing SMTP settings to prevent tampering or credential exposure
        if (!isPlatformAdmin && existingConfig) {
            finalSmtpServer = existingConfig.smtpServer;
            finalSmtpEmailAddress = existingConfig.smtpEmailAddress;
            finalSmtpEmailPort = existingConfig.smtpEmailPort;
            finalPassword = existingConfig.smtpEmailPassword;
        } else if (existingConfig && (!smtpEmailPassword || smtpEmailPassword === '••••••••')) {
            finalPassword = existingConfig.smtpEmailPassword;
        }

        if (existingConfig) {
            await existingConfig.update({
                serviceTaxPercentage,
                dueDays,
                invoiceNoStartingFrom,
                cancelBookingHours,
                invoiceNoPrefix,
                smtpServer: finalSmtpServer,
                smtpEmailAddress: finalSmtpEmailAddress,
                smtpEmailPassword: finalPassword,
                smtpEmailPort: finalSmtpEmailPort,
                outstationHasTax
            });

            const updatedConfig = existingConfig.toJSON() as any;
            if (updatedConfig.smtpEmailPassword) {
                updatedConfig.smtpEmailPassword = '••••••••';
            }

            res.status(200).json({
                success: true,
                message: 'Configuration updated successfully',
                data: updatedConfig
            });
        } else {
            const newConfig = await Configuration.create({
                serviceTaxPercentage,
                dueDays,
                invoiceNoStartingFrom,
                cancelBookingHours,
                invoiceNoPrefix,
                smtpServer,
                smtpEmailAddress,
                smtpEmailPassword: finalPassword,
                smtpEmailPort,
                outstationHasTax
            });

            const createdConfig = newConfig.toJSON() as any;
            if (createdConfig.smtpEmailPassword) {
                createdConfig.smtpEmailPassword = '••••••••';
            }

            res.status(201).json({
                success: true,
                message: 'Configuration created successfully',
                data: createdConfig
            });
        }

    } catch (error) {
        console.error('Error creating/updating configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get configuration
export const getConfiguration = async (req: Request, res: Response): Promise<void> => {
    try {
        const configuration = await Configuration.findOne();

        if (!configuration) {
            res.status(404).json({
                success: false,
                message: 'Configuration not found'
            });
            return;
        }

        const safeConfig = configuration.toJSON() as any;
        // Redact plain text SMTP password
        if (safeConfig.smtpEmailPassword) {
            safeConfig.smtpEmailPassword = '••••••••';
        }

        res.status(200).json({
            success: true,
            message: 'Configuration retrieved successfully',
            data: safeConfig
        });

    } catch (error) {
        console.error('Error fetching configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};