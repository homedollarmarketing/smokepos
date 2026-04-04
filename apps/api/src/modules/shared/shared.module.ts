import { Global, Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { StorageService } from './services/storage.service';
import { PdfService } from './services/pdf.service';

import { MulterModule } from '@nestjs/platform-express';

@Global()
@Module({
  imports: [
    MulterModule.register({
      // No dest: use memory storage
    }),
  ],
  providers: [EmailService, StorageService, PdfService],
  exports: [EmailService, StorageService, PdfService, MulterModule],
})
export class SharedModule {}
