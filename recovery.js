import './src/config/env.js';
import mongoose from 'mongoose';
import Admin from './src/models/admin.js';
import connectDB from './src/config/db.js';

const resetAdmin = async () => {
    try {
        await connectDB();
        
        // 1. List existing admins
        const admins = await Admin.find({}, 'email');
        if (admins.length > 0) {
            console.log('--- Existing Admin Emails ---');
            admins.forEach(a => console.log(`- ${a.email}`));
        } else {
            console.log('No admins found in the database.');
        }

        // 2. Create/Update a default admin for recovery
        const recoveryEmail = 'admin@narayan.com';
        const recoveryPass = 'admin123';
        
        const existing = await Admin.findOne({ email: recoveryEmail });
        if (existing) {
            existing.password = recoveryPass;
            await existing.save();
            console.log(`\nSuccessfully reset password for existing admin: ${recoveryEmail}`);
        } else {
            await Admin.create({ email: recoveryEmail, password: recoveryPass });
            console.log(`\nSuccessfully created new recovery admin: ${recoveryEmail}`);
        }

        console.log(`\nYou can now log in with:`);
        console.log(`Email: ${recoveryEmail}`);
        console.log(`Password: ${recoveryPass}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

resetAdmin().catch(err => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
