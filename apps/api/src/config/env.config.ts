import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import * as dotenv from 'dotenv';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('4020')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: 'PORT must be a valid number',
    }),
  HOST: z.string().default('localhost'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('https://smokepos.homedollarmarketing.com'),

  // Database
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: 'DB_PORT must be a valid number',
    })
    .optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // OTP
  OTP_EXPIRES_IN: z
    .string()
    .default('600000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: 'OTP_EXPIRES_IN must be a valid number',
    }),
  OTP_LENGTH: z
    .string()
    .default('6')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: 'OTP_LENGTH must be a valid number',
    }),

  // S3 Storage
  S3_STORAGE_ENDPOINT: z.url(),
  S3_STORAGE_REGION: z.string(),
  S3_STORAGE_ACCESS_KEY_ID: z.string(),
  S3_STORAGE_SECRET_ACCESS_KEY: z.string(),
  S3_STORAGE_BUCKET_NAME: z.string(),
  S3_STORAGE_BUCKET_ENDPOINT: z.url(),

  // Email
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'MAIL_PORT must be a valid number',
    })
    .optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
});

type EnvSchema = z.infer<typeof envSchema>;

@Injectable()
export class EnvService {
  private readonly envConfig: EnvSchema;

  constructor() {
    dotenv.config();

    const { error, data } = envSchema.safeParse(process.env);

    if (error) {
      throw new Error(
        `Environment variable validation error: ${error.message}`,
      );
    }

    this.envConfig = data;
  }

  get<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
    return this.envConfig[key];
  }

  get all(): EnvSchema {
    return this.envConfig;
  }
}
