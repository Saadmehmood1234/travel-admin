// "use client";
// import React from "react";
// import DynamicPage from "../components/dynamic-page";

// const ProductLayout = () => {
//   // Content title bar configuration
//   const contentTitleBarContent = {
//     title: "Products",
//     subTitle: "Manage all products in your store",
//     buttons: [
//       {
//         text: "Add Product",
//         color: "#fff",
//         bgColor: "#2563eb", // Tailwind blue-600 equivalent
//       },
//     ],
//   };

//   // Table content configuration
//   const tableContent = {
//     columns: [
//       {
//         accessorKey: "name",
//         header: "Product Name",
//       },
//       {
//         accessorKey: "category",
//         header: "Category",
//       },
//       {
//         accessorKey: "price",
//         header: "Price",
//         cell: ({ row }) => {
//           const price = parseFloat(row.getValue("price"))
//           const formatted = new Intl.NumberFormat("en-US", {
//             style: "currency",
//             currency: "USD",
//           }).format(price)
//           return <div className="text-right font-medium">{formatted}</div>
//         },
//       },
//       {
//         accessorKey: "inStock",
//         header: "In Stock",
//         cell: ({ row }) => {
//           const value: boolean = row.getValue("inStock")
//           return value ? (
//             <span className="text-green-600 font-semibold">Yes</span>
//           ) : (
//             <span className="text-red-600 font-semibold">No</span>
//           )
//         },
//       },
//       {
//         id: "actions", // ✅ required for custom UI header
//         header: () => <span>Actions</span>,
//         cell: ({ row }) => {
//           const product = row.original
//           return (
//             <button
//               onClick={() => console.log("View product:", product)}
//               className="text-blue-600 hover:underline"
//             >
//               View
//             </button>
//           )
//         },
//       },
//     ], 
//     rows:[
//       {
//         id: "p1",
//         name: "Wireless Mouse",
//         category: "Electronics",
//         price: 25.99,
//         inStock: true,
//       },
//       {
//         id: "p2",
//         name: "Mechanical Keyboard",
//         category: "Electronics",
//         price: 89.5,
//         inStock: true,
//       },
//       {
//         id: "p3",
//         name: "Gaming Chair",
//         category: "Furniture",
//         price: 199.99,
//         inStock: false,
//       },
//       {
//         id: "p4",
//         name: "LED Desk Lamp",
//         category: "Home & Office",
//         price: 39.99,
//         inStock: true,
//       },
//     ]
//   };

//   return (
//     <DynamicPage
//       contentTitleBarContent={contentTitleBarContent}
//       tableContent={tableContent}
//     />
//   );
// };

// export default ProductLayout;


"use client";
import React, { useEffect, useState } from "react";
import DynamicPage from "../components/dynamic-page";
import { getProducts, deleteProduct } from "@/actions/product.actions";
import { toast } from "react-hot-toast";

const ProductLayout = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      console.log(res.data);
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
            currency: "USD",
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
                onClick={() => console.log("Edit product:", product)}
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
    </>
  );
};

export default ProductLayout;