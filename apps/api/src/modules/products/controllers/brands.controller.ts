import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReqAuthUser } from '../../../common/decorators/req-auth-user.decorator';
import { AuthUser } from '../../../common/types/auth-user.interface';
import { BrandsService } from '../services/brands.service';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';
import { ScopedQueryDto } from '../dtos/scoped-query.dto';

@Controller({ path: 'brands', version: '1' })
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
    @ReqAuthUser() authUser?: AuthUser
  ) {
    return this.brandsService.create(createBrandDto, file, authUser);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: ScopedQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
    @ReqAuthUser() authUser?: AuthUser
  ) {
    console.log(authUser);
    return this.brandsService.update(id, updateBrandDto, file, authUser);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @ReqAuthUser() authUser?: AuthUser) {
    return this.brandsService.remove(id, authUser);
  }
}
