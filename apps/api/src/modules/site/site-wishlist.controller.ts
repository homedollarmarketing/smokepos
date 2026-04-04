import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReqAuthUser } from '../../common/decorators/req-auth-user.decorator';
import { WishlistService } from '../customers/services/wishlist.service';

@Controller({ path: 'site/wishlist', version: '1' })
export class SiteWishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * Get customer's wishlist
   */
  @Get()
  async getWishlist(@ReqAuthUser('customerId') customerId: string | null) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.wishlistService.getWishlist(customerId);
  }

  /**
   * Get just the product IDs in the wishlist (for quick checks)
   */
  @Get('product-ids')
  async getWishlistProductIds(@ReqAuthUser('customerId') customerId: string | null) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.wishlistService.getWishlistProductIds(customerId);
  }

  /**
   * Add a product to wishlist
   */
  @Post(':productId')
  async addToWishlist(
    @Param('productId', ParseUUIDPipe) productId: string,
    @ReqAuthUser('customerId') customerId: string | null
  ) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.wishlistService.addToWishlist(customerId, productId);
  }

  /**
   * Remove a product from wishlist
   */
  @Delete(':productId')
  async removeFromWishlist(
    @Param('productId', ParseUUIDPipe) productId: string,
    @ReqAuthUser('customerId') customerId: string | null
  ) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.wishlistService.removeFromWishlist(customerId, productId);
  }

  /**
   * Check if a product is in the wishlist
   */
  @Get('check/:productId')
  async isInWishlist(
    @Param('productId', ParseUUIDPipe) productId: string,
    @ReqAuthUser('customerId') customerId: string | null
  ) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.wishlistService.isInWishlist(customerId, productId);
  }
}
