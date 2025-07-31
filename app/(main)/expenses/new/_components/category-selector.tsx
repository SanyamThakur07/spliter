"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: string;
  name: string;
};
type CategorySelectorProps = {
  categories: Category[];
  onChange: (id: string) => void;
};

const CategorySelector = ({ categories, onChange }: CategorySelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onChange(categoryId);
  };
  if (!categories || categories.length === 0) {
    return <div>No categories available</div>;
  }

  return (
    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default CategorySelector;
