import { Button } from "@/components/ui/button";
import { ContentTitleBarProps } from "@/types";
import React, { useState } from "react";
import AddProductForm from "./AddProduct";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ContentTitleBar = ({ contentTitleBarContent }: { contentTitleBarContent: ContentTitleBarProps }) => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const { title, subTitle, buttons } = contentTitleBarContent;

  const handleAddProductToggle = () => {
    setIsAddProductOpen(prev => !prev);
  };

  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
        <p className="text-sm text-gray-500">{subTitle}</p>
      </div>

      <div className="flex gap-2 items-center">
        {buttons?.map((button, index) => (
          <Button
            key={index}
            onClick={handleAddProductToggle}
            style={{
              color: button.color || "white",
              backgroundColor: button.bgColor || "#2563eb",
            }}
          >
            {button.text}
          </Button>
        ))}
      </div>

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <AddProductForm onSuccess={() => setIsAddProductOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentTitleBar;