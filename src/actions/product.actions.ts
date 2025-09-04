"use server";

import dbConnect from "@/lib/dbConnect";
import Product from "@/models/product.model";
import { IProduct, SerializedProduct, ProductCategory } from "@/types/product";

const serializeProduct = (product: IProduct): SerializedProduct => ({
  ...product.toObject(),
  _id: product._id.toString(),
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});

export const getProducts = async (): Promise<{
  success: boolean;
  data?: SerializedProduct[];
  error?: string;
}> => {
  try {
    await dbConnect();
    const products = await Product.find({});
    return {
      success: true,
      data: products.map(serializeProduct),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch products",
    };
  }
};

export const getFeaturedProducts = async (): Promise<{
  success: boolean;
  data?: SerializedProduct[];
  error?: string;
}> => {
  try {
    await dbConnect();
    const products = await Product.find({ featured: true });
    return {
      success: true,
      data: products.map(serializeProduct),
    };
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return {
      success: false,
      error: "Failed to fetch featured products",
    };
  }
};

export const getProductsByCategory = async (
  category: ProductCategory
): Promise<{
  success: boolean;
  data?: SerializedProduct[];
  error?: string;
}> => {
  try {
    await dbConnect();
    const products = await Product.find({ category });
    return {
      success: true,
      data: products.map(serializeProduct),
    };
  } catch (error) {
    console.error(`Error fetching ${category} products:`, error);
    return {
      success: false,
      error: `Failed to fetch ${category} products`,
    };
  }
};

export const getProductById = async (
  id: string
): Promise<{
  success: boolean;
  data?: SerializedProduct;
  error?: string;
}> => {
  try {
    await dbConnect();
    const product = await Product.findById(id);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }
    return {
      success: true,
      data: serializeProduct(product),
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: "Failed to fetch product",
    };
  }
};


export type DifficultyLevel = "Easy" | "Moderate" | "Hard";

export interface ProductInput {
  name: string;
  location: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  duration: string;
  category: ProductCategory;
  tripType: 'International' | 'Domestic';
  image: string;
  featured: boolean;
  discount: number;
  highlights?: string[];
  groupSize?: string;
  difficulty?: DifficultyLevel;
  availableDates?: Date[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: string[];
  isCommunityTrip?: boolean;
}

export const createProduct = async (
  productData: ProductInput
): Promise<{
  success: boolean;
  data?: SerializedProduct;
  error?: string;
}> => {
  try {
    await dbConnect();
console.log("Before Creation",productData)
    const product = await Product.create(productData);
           console.log("After Creation",product)
    return {
      success: true,
      data: serializeProduct(product),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: "Failed to create product",
    };
  }
};


export const updateProduct = async (
  id: string,
  updateData: Partial<IProduct>
): Promise<{
  success: boolean;
  data?: SerializedProduct;
  error?: string;
}> => {
  try {
    await dbConnect();
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }
    return {
      success: true,
      data: serializeProduct(product),
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: "Failed to update product",
    };
  }
};

export const deleteProduct = async (
  id: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await dbConnect();
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      return {
        success: false,
        error: "Product not found",
      };
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Failed to delete product",
    };
  }
};

export const getProductsCount = async (): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> => {
  try {
    await dbConnect();
    const count = await Product.countDocuments();
    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error("Error counting products:", error);
    return {
      success: false,
      error: "Failed to count products",
    };
  }
};

export const getProductsCountByCategory = async (): Promise<{
  success: boolean;
  data?: { category: ProductCategory; count: number }[];
  error?: string;
}> => {
  try {
    await dbConnect();
    const counts = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    return {
      success: true,
      data: counts,
    };
  } catch (error) {
    console.error("Error counting products by category:", error);
    return {
      success: false,
      error: "Failed to count products by category",
    };
  }
};

export const getProductsCountByFeatured = async (): Promise<{
  success: boolean;
  featured?: number;
  nonFeatured?: number;
  error?: string;
}> => {
  try {
    await dbConnect();
    const [featuredCount, nonFeaturedCount] = await Promise.all([
      Product.countDocuments({ featured: true }),
      Product.countDocuments({ featured: false })
    ]);
    
    return {
      success: true,
      featured: featuredCount,
      nonFeatured: nonFeaturedCount,
    };
  } catch (error) {
    console.error("Error counting products by featured status:", error);
    return {
      success: false,
      error: "Failed to count products by featured status",
    };
  }
};

export const getProductsStats = async (): Promise<{
  success: boolean;
  data?: {
    total: number;
    byCategory: { category: ProductCategory; count: number }[];
    featured: number;
    nonFeatured: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
  };
  error?: string;
}> => {
  try {
    await dbConnect();
    
    const [total, byCategory, featuredCount, priceStats] = await Promise.all([
      Product.countDocuments(),
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            category: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]),
      Product.countDocuments({ featured: true }),
      Product.aggregate([
        {
          $group: {
            _id: null,
            averagePrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" }
          }
        }
      ])
    ]);
    
    const nonFeaturedCount = total - featuredCount;
    const priceData = priceStats[0] || { averagePrice: 0, minPrice: 0, maxPrice: 0 };
    
    return {
      success: true,
      data: {
        total,
        byCategory,
        featured: featuredCount,
        nonFeatured: nonFeaturedCount,
        averagePrice: Math.round(priceData.averagePrice || 0),
        minPrice: priceData.minPrice || 0,
        maxPrice: priceData.maxPrice || 0,
      },
    };
  } catch (error) {
    console.error("Error getting product statistics:", error);
    return {
      success: false,
      error: "Failed to get product statistics",
    };
  }
};