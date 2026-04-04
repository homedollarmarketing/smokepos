import { resolve } from 'path';
import { readFileSync } from 'fs';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from '../config/database.config';
import { Customer } from '../modules/customers/entities/customer.entity';
import { Branch } from '../modules/branches/entities/branch.entity';

async function migrateCustomers() {
    const dataSource = new DataSource(getDataSourceOptions());

    try {
        console.log('Connecting to database...');
        await dataSource.initialize();
        console.log('Connected to database.');

        // 1. Get Main Branch
        const branchRepo = dataSource.getRepository(Branch);
        const mainBranch = await branchRepo.findOne({
            where: { isMain: true },
        });

        if (!mainBranch) {
            console.error('Error: Main branch not found. Please create a main branch first.');
            process.exit(1);
        }
        console.log(`Found main branch: ${mainBranch.name} (${mainBranch.id})`);

        // 2. Read customers.json
        const jsonPath = resolve(__dirname, '../../data/customers.json');
        console.log(`Reading customers from: ${jsonPath}`);
        const rawData = readFileSync(jsonPath, 'utf-8');
        const customersData = JSON.parse(rawData);

        if (!Array.isArray(customersData)) {
            throw new Error('Invalid JSON format: Expected an array of customers.');
        }

        console.log(`Found ${customersData.length} customers to migrate.`);

        // 3. Migrate Customers
        const customerRepo = dataSource.getRepository(Customer);
        let successCount = 0;
        let errorCount = 0;

        for (const data of customersData) {
            try {
                // Check if customer already exists (by ID)
                const existing = await customerRepo.findOne({ where: { id: data.id } });

                let customer = existing;
                if (!customer) {
                    customer = new Customer();
                    customer.id = data.id; // Preserve UUID
                    console.log(`Creating new customer: ${data.name}`);
                } else {
                    console.log(`Updating existing customer: ${data.name}`);
                }

                // Map fields
                customer.name = data.name;
                customer.phoneNumber = data.phone;
                customer.email = data.email || null;
                customer.notes = data.notes || null;

                // dates
                if (data.createdAt) {
                    customer.createdAt = new Date(data.createdAt);
                }
                if (data.updatedAt) {
                    customer.updatedAt = new Date(data.updatedAt);
                }

                // Set Branch
                customer.branch = mainBranch;
                customer.branchId = mainBranch.id;

                // Set Photo (Dicebear)
                // Using 'initials' style as requested/implied standard, or could use others. 
                // User said "default dicebear pngs". 
                // URL format: https://api.dicebear.com/7.x/initials/png?seed=Name
                const seed = encodeURIComponent(data.name || 'Customer');
                customer.photoUrl = `https://api.dicebear.com/7.x/initials/png?seed=${seed}`;

                await customerRepo.save(customer);
                successCount++;
            } catch (err: any) {
                console.error(`Failed to migrate customer ${data.name} (${data.id}):`, err.message);
                errorCount++;
            }
        }

        console.log('Migration completed.');
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

migrateCustomers();
