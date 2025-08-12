"use client";
import React from "react";
import DynamicPage from "../components/dynamic-page";

const ProductLayout = () => {
  // Content title bar configuration
  const contentTitleBarContent = {
    title: "Products",
    subTitle: "Manage all products in your store",
    buttons: [
      {
        text: "Add Product",
        color: "#fff",
        bgColor: "#2563eb", // Tailwind blue-600 equivalent
      },
    ],
  };

  // Table content configuration
  const tableContent = {
    columns: [
      {
        accessorKey: "name",
        header: "Product Name",
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const price = parseFloat(row.getValue("price"))
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(price)
          return <div className="text-right font-medium">{formatted}</div>
        },
      },
      {
        accessorKey: "inStock",
        header: "In Stock",
        cell: ({ row }) => {
          const value: boolean = row.getValue("inStock")
          return value ? (
            <span className="text-green-600 font-semibold">Yes</span>
          ) : (
            <span className="text-red-600 font-semibold">No</span>
          )
        },
      },
      {
        id: "actions", // ✅ required for custom UI header
        header: () => <span>Actions</span>,
        cell: ({ row }) => {
          const product = row.original
          return (
            <button
              onClick={() => console.log("View product:", product)}
              className="text-blue-600 hover:underline"
            >
              View
            </button>
          )
        },
      },
    ], 
    rows:[
      {
        id: "p1",
        name: "Wireless Mouse",
        category: "Electronics",
        price: 25.99,
        inStock: true,
      },
      {
        id: "p2",
        name: "Mechanical Keyboard",
        category: "Electronics",
        price: 89.5,
        inStock: true,
      },
      {
        id: "p3",
        name: "Gaming Chair",
        category: "Furniture",
        price: 199.99,
        inStock: false,
      },
      {
        id: "p4",
        name: "LED Desk Lamp",
        category: "Home & Office",
        price: 39.99,
        inStock: true,
      },
    ]
  };

  return (
    <DynamicPage
      contentTitleBarContent={contentTitleBarContent}
      tableContent={tableContent}
    />
  );
};

export default ProductLayout;
