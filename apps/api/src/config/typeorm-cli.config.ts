import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { EnvService } from './env.config';
import { getDatabaseConfig } from './database.config';

config();

const envService = new EnvService();

export default new DataSource(getDatabaseConfig(envService) as any);
