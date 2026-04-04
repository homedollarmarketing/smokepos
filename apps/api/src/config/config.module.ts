import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { EnvService } from './env.config';

@Global()
@Module({
  imports: [NestConfigModule],
  providers: [EnvService],
  exports: [EnvService],
})
export class ConfigModule {}
