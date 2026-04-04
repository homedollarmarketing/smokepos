import { Controller, Get, Post, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SiteService } from './site.service';
import { SiteProductsQueryDto, SiteCategoriesQueryDto, SiteBrandsQueryDto } from './dto';
import { CreateMessageDto } from '../messages/dto';
import { MessagesService } from '../messages/messages.service';
import { EmailService } from '../shared/services/email.service';
import { EnvService } from '../../config/env.config';

@Controller({ path: 'site', version: '1' })
@Public()
export class SiteController {
  constructor(
    private readonly siteService: SiteService,
    private readonly messagesService: MessagesService,
    private readonly emailService: EmailService,
    private readonly envService: EnvService
  ) {}

  /**
   * Get products for the public site
   * GET /site/products
   * Query params: page, limit, featured, categoryId, brandId, search
   */
  @Get('products')
  async getProducts(@Query() query: SiteProductsQueryDto) {
    return this.siteService.getProducts(query);
  }

  /**
   * Get a single product by slug
   * GET /site/products/:slug
   */
  @Get('products/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const product = await this.siteService.getProductBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    return product;
  }

  /**
   * Get categories for the public site
   * GET /site/categories
   */
  @Get('categories')
  async getCategories(@Query() query: SiteCategoriesQueryDto) {
    return this.siteService.getCategories(query);
  }

  /**
   * Get a single category by slug
   * GET /site/categories/:slug
   */
  @Get('categories/:slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    const category = await this.siteService.getCategoryBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    return category;
  }

  /**
   * Get brands for the public site
   * GET /site/brands
   */
  @Get('brands')
  async getBrands(@Query() query: SiteBrandsQueryDto) {
    return this.siteService.getBrands(query);
  }

  /**
   * Submit a contact message from the public site
   * POST /site/messages
   */
  @Post('messages')
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    // Get main branch
    const mainBranch = await this.messagesService.getMainBranch();
    if (!mainBranch) {
      throw new NotFoundException('Main branch not configured');
    }

    // Create the message
    const message = await this.messagesService.create(createMessageDto, mainBranch.id);

    // Send notification to the company email
    const adminEmail = this.envService.get('MAIL_USER');
    if (adminEmail) {
      await this.emailService.sendNewMessageNotification({
        adminEmails: [adminEmail],
        customerName: createMessageDto.name,
        customerEmail: createMessageDto.email,
        subject: createMessageDto.subject,
        message: createMessageDto.message,
      });
    }

    return { success: true, message: 'Your message has been sent successfully' };
  }
}
