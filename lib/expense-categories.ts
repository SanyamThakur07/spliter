// lib/expense-categories.ts
import {
    Coffee,
    ShoppingBag,
    Utensils,
    Plane,
    Car,
    Home,
    Film,
    ShoppingCart,
    Ticket,
    Wifi,
    Droplets,
    GraduationCap,
    Heart,
    Stethoscope,
    Gift,
    Smartphone,
    MoreHorizontal,
    CreditCard,
    Baby,
    Music,
    Book,
    DollarSign,
    LucideIcon,
} from "lucide-react";

// Type definitions
type ExpenseCategory = {
    id: string;
    name: string;
    icon: LucideIcon;
};

type ExpenseCategoriesMap = {
    [key: string]: ExpenseCategory;
};

// Object containing all categories with their respective icons
export const EXPENSE_CATEGORIES: ExpenseCategoriesMap = {
    foodDrink: {
        id: "foodDrink",
        name: "Food & Drink",
        icon: Utensils,
    },
    coffee: {
        id: "coffee",
        name: "Coffee",
        icon: Coffee,
    },
    groceries: {
        id: "groceries",
        name: "Groceries",
        icon: ShoppingCart,
    },
    shopping: {
        id: "shopping",
        name: "Shopping",
        icon: ShoppingBag,
    },
    travel: {
        id: "travel",
        name: "Travel",
        icon: Plane,
    },
    transportation: {
        id: "transportation",
        name: "Transportation",
        icon: Car,
    },
    housing: {
        id: "housing",
        name: "Housing",
        icon: Home,
    },
    entertainment: {
        id: "entertainment",
        name: "Entertainment",
        icon: Film,
    },
    tickets: {
        id: "tickets",
        name: "Tickets",
        icon: Ticket,
    },
    utilities: {
        id: "utilities",
        name: "Utilities",
        icon: Wifi,
    },
    water: {
        id: "water",
        name: "Water",
        icon: Droplets,
    },
    education: {
        id: "education",
        name: "Education",
        icon: GraduationCap,
    },
    health: {
        id: "health",
        name: "Health",
        icon: Stethoscope,
    },
    personal: {
        id: "personal",
        name: "Personal",
        icon: Heart,
    },
    gifts: {
        id: "gifts",
        name: "Gifts",
        icon: Gift,
    },
    technology: {
        id: "technology",
        name: "Technology",
        icon: Smartphone,
    },
    bills: {
        id: "bills",
        name: "Bills & Fees",
        icon: CreditCard,
    },
    baby: {
        id: "baby",
        name: "Baby & Kids",
        icon: Baby,
    },
    music: {
        id: "music",
        name: "Music",
        icon: Music,
    },
    books: {
        id: "books",
        name: "Books",
        icon: Book,
    },
    other: {
        id: "other",
        name: "Other",
        icon: MoreHorizontal,
    },
    general: {
        id: "general",
        name: "General Expense",
        icon: DollarSign,
    },
};

// Helper function to get category by ID
export const getCategoryById = (categoryId: string): ExpenseCategory => {
    return EXPENSE_CATEGORIES[categoryId] || EXPENSE_CATEGORIES.other;
};

// Get array of all categories (useful for dropdowns)
export const getAllCategories = (): ExpenseCategory[] => {
    return Object.values(EXPENSE_CATEGORIES);
};

// Get icon for a category
export const getCategoryIcon = (categoryId: string): LucideIcon => {
    const category = getCategoryById(categoryId);
    return category.icon;
};