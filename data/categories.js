export const defaultCategories = [
    // CREDIT Categories
    {
      id: "salary",
      name: "Salary",
      type: "CREDIT",
      color: "#22c55e", // green-500
      icon: "Wallet",
    },
    {
      id: "freelance",
      name: "Freelance",
      type: "CREDIT",
      color: "#0ea5e9", // sky-500 (lighter cyan, fits your theme)
      icon: "Laptop",
    },
    {
      id: "investments",
      name: "Investments",
      type: "CREDIT",
      color: "#14b8a6", // teal-500
      icon: "TrendingUp",
    },
    {
      id: "business",
      name: "Business",
      type: "CREDIT",
      color: "#6366f1", // indigo-500 (trustworthy, corporate vibe)
      icon: "Building",
    },
    {
      id: "rental",
      name: "Rental",
      type: "CREDIT",
      color: "#f59e0b", // amber-500
      icon: "Home",
    },
    {
      id: "other-income",
      name: "Other Income",
      type: "CREDIT",
      color: "#64748b", // slate-500 (neutral gray)
      icon: "Plus",
    },
  
    // DEBIT Categories
    {
      id: "housing",
      name: "Housing",
      type: "DEBIT",
      color: "#f43f5e", // rose-500 (softer red than harsh red-500)
      icon: "Home",
      subcategories: ["Rent", "Mortgage", "Property Tax", "Maintenance"],
    },
    {
      id: "transportation",
      name: "Transportation",
      type: "DEBIT",
      color: "#f97316", // orange-500
      icon: "Car",
      subcategories: ["Fuel", "Public Transport", "Maintenance", "Parking"],
    },
    {
      id: "groceries",
      name: "Groceries",
      type: "DEBIT",
      color: "#84cc16", // lime-500
      icon: "Shopping",
    },
    {
      id: "utilities",
      name: "Utilities",
      type: "DEBIT",
      color: "#06b6d4", // cyan-500 (matches your theme!)
      icon: "Zap",
      subcategories: ["Electricity", "Water", "Gas", "Internet", "Phone"],
    },
    {
      id: "entertainment",
      name: "Entertainment",
      type: "DEBIT",
      color: "#a855f7", // purple-500 (playful vibe)
      icon: "Film",
      subcategories: ["Movies", "Games", "Streaming Services"],
    },
    {
      id: "food",
      name: "Food",
      type: "DEBIT",
      color: "#fb7185", // rose-400 (lighter pink-red, more appetizing)
      icon: "UtensilsCrossed",
    },
    {
      id: "shopping",
      name: "Shopping",
      type: "DEBIT",
      color: "#ec4899", // pink-500
      icon: "ShoppingBag",
      subcategories: ["Clothing", "Electronics", "Home Goods"],
    },
    {
      id: "healthcare",
      name: "Healthcare",
      type: "DEBIT",
      color: "#0d9488", // teal-600 (calm, medical vibe)
      icon: "HeartPulse",
      subcategories: ["Medical", "Dental", "Pharmacy", "Insurance"],
    },
    {
      id: "education",
      name: "Education",
      type: "DEBIT",
      color: "#3b82f6", // blue-500
      icon: "GraduationCap",
      subcategories: ["Tuition", "Books", "Courses"],
    },
    {
      id: "personal",
      name: "Personal Care",
      type: "DEBIT",
      color: "#d946ef", // fuchsia-500
      icon: "Smile",
      subcategories: ["Haircut", "Gym", "Beauty"],
    },
    {
      id: "travel",
      name: "Travel",
      type: "DEBIT",
      color: "#0ea5e9", // sky-500
      icon: "Plane",
    },
    {
      id: "insurance",
      name: "Insurance",
      type: "DEBIT",
      color: "#64748b", // slate-500
      icon: "Shield",
      subcategories: ["Life", "Home", "Vehicle"],
    },
    {
      id: "gifts",
      name: "Gifts & Donations",
      type: "DEBIT",
      color: "#f472b6", // pink-400
      icon: "Gift",
    },
    {
      id: "bills",
      name: "Bills & Fees",
      type: "DEBIT",
      color: "#e11d48", // rose-600 (strong red, fits bills/penalties)
      icon: "Receipt",
      subcategories: ["Bank Fees", "Late Fees", "Service Charges"],
    },
    {
      id: "other-expense",
      name: "Other expenses",
      type: "DEBIT",
      color: "#94a3b8", // slate-400
      icon: "MoreHorizontal",
    },
  ];
  
  export const categoryColors = defaultCategories.reduce((acc, category) => {
    acc[category.id] = category.color;
    return acc;
  }, {});
  