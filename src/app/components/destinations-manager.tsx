"use client";
import React, { useEffect, useState } from "react";
import DynamicPage from "../components/dynamic-page";
import { getProducts, deleteProduct, updateProduct } from "@/actions/product.actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const ProductLayout = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    category: "",
    price: "",
    originalPrice: "",
    discount: "",
    rating: "",
    reviews: "",
    featured: false,
    description: ""
  });
  
  const router = useRouter();
  const { data: session, status } = useSession();
  
  if (!session) {
    router.push("/auth/signin");
    return;
  }

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []); 
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openDeleteModal = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
    setIsDeleting(false);
  };

  const openEditModal = (product: any) => {
    setProductToEdit(product);
    setFormData({
      name: product.name || "",
      location: product.location || "",
      category: product.category || "",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      discount: product.discount?.toString() || "",
      rating: product.rating?.toString() || "",
      reviews: product.reviews?.toString() || "0",
      featured: product.featured || false,
      description: product.description || ""
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setProductToEdit(null);
    setIsEditing(false);
    setFormData({
      name: "",
      location: "",
      category: "",
      price: "",
      originalPrice: "",
      discount: "",
      rating: "",
      reviews: "",
      featured: false,
      description: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteProduct(productToDelete);

      if (result.success) {
        toast.success("Product deleted successfully");
        fetchProducts(); // Refresh the product list
        closeDeleteModal();
      } else {
        throw new Error(result.error || "Failed to delete product");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

const handleEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!productToEdit) return;
  
  setIsEditing(true);
  try {
    // Validate category
    const validCategories = ["Beach", "Adventure", "Luxury", "Family-Friendly"] as const;
    const category = validCategories.includes(formData.category as any) 
      ? formData.category as "Beach" | "Adventure" | "Luxury" | "Family-Friendly"
      : undefined;

    const updatedData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      discount: formData.discount ? parseFloat(formData.discount) : undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      reviews: parseInt(formData.reviews) || 0,
      featured: formData.featured,
      category: category // Use the validated category
    };

    const result = await updateProduct(productToEdit._id, updatedData);

    if (result.success) {
      toast.success("Product updated successfully");
      fetchProducts(); // Refresh the product list
      closeEditModal();
    } else {
      throw new Error(result.error || "Failed to update product");
    }
  } catch (error) {
    toast.error("Failed to update product");
  } finally {
    setIsEditing(false);
  }
};

  const contentTitleBarContent = {
    title: "Products",
    subTitle: "Manage all travel packages in your store",
    buttons: [
      {
        text: "Add Product",
        color: "#fff",
        bgColor: "#2563eb",
      },
    ],
  };

  const tableContent = {
    columns: [
      { accessorKey: "name", header: "Package Name" },
      { accessorKey: "location", header: "Location" },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => {
          const category = row.getValue("category");
          const categoryColors: Record<string, string> = {
            Beach: "bg-blue-100 text-blue-800",
            Adventure: "bg-green-100 text-green-800",
            Luxury: "bg-purple-100 text-purple-800",
            "Family-Friendly": "bg-yellow-100 text-yellow-800",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                categoryColors[category] || "bg-gray-100 text-gray-800"
              }`}
            >
              {category}
            </span>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => {
          const price = parseFloat(row.getValue("price"));
          const originalPrice = parseFloat(row.original.originalPrice || price);
          const discount = row.original.discount || 0;

          const formattedPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "INR",
          }).format(price);

          return (
            <div className="text-right">
              {discount > 0 && (
                <span className="line-through text-gray-400 mr-2">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(originalPrice)}
                </span>
              )}
              <span className="font-medium">{formattedPrice}</span>
              {discount > 0 && (
                <span className="ml-2 text-red-500 text-xs font-semibold">
                  {discount}% OFF
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => {
          const rating = parseFloat(row.getValue("rating") || 0);
          return (
            <div className="flex items-center">
              <span className="mr-1 font-medium">{rating.toFixed(1)}</span>
              <span className="text-yellow-400">★</span>
              <span className="text-gray-400 text-xs ml-1">
                ({row.original.reviews || 0} reviews)
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "featured",
        header: "Featured",
        cell: ({ row }: any) => {
          const featured: boolean = row.getValue("featured");
          return featured ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Featured
            </span>
          ) : null;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => {
          const product = row.original;
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(product)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => openDeleteModal(product._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    rows: products,
  };

  return (
    <>
      <DynamicPage
        contentTitleBarContent={contentTitleBarContent}
        tableContent={tableContent}
      />

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Beach">Beach</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Family-Friendly">Family-Friendly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isEditing}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isEditing ? "Updating..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}  
    </>
  );
};

export default ProductLayout;