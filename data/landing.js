import {
    BarChart3,
    CreditCard,
    ScanEye,
    PieChart,
    Globe,
    Zap,
    ShieldCheck,
    UserPlus,
    FileUp,
    TrendingUp,

  } from "lucide-react"
  
  export const featuresData = [
    {
      icon: <BarChart3 className="h-8 w-8 text-[#06b6d4]" />,
      title: "Analytics",
      description:
        "Get detailed insights into your spending habits with AI-powered analytics",
    },
    {
      icon: <ScanEye className="h-8 w-8 text-[#06b6d4]" />,
      title: "Smart Detection",
      description:
        "Upload payment history screenshots and let AI automatically detect and categorize your expenses",
    },
    {
      icon: <PieChart className="h-8 w-8 text-[#06b6d4]" />,
      title: "Spending Breakdown",
      description:
        "Visualize your monthly spending by categories like food, travel, and bills",
    },
    {
      icon: <Globe className="h-8 w-8 text-[#06b6d4]" />,
      title: "Multi-Currency Support",
      description:
        "Track expenses in different currencies and get real-time conversions",
    },
    {
      icon: <Zap className="h-8 w-8 text-[#06b6d4]" />,
      title: "AI-Powered Suggestions",
      description:
        "Receive personalized tips to save more based on your habits and goals",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-[#06b6d4]" />,
      title: "Secure & Private",
      description:
        "Your financial data is encrypted end-to-end and never shared without consent",
    },
  ]
  
  export const howto=[
    {
        icon: (
            <div className="h-16 w-16 rounded-full border-0  flex items-center justify-center bg-[#E6F9FF]">
              <UserPlus className="h-8 w-8 text-[#00C2FF]" />
            </div>
          ),
        title:"1. Create Your Account",
        description:"Create your free account in seconds using your email, or log in if you already have one. No complicated setup required",
    },
    {
        icon: (
            <div className="h-16 w-16 rounded-full border-0  flex items-center justify-center bg-[#E6F9FF]">
              <FileUp className="h-8 w-8 text-[#00C2FF]" />
            </div>
          ),
        title:"2. Add Your Expenses",
        description:"Snap a screenshot of your transaction history or upload a statement — our AI automatically detects and organizes your expenses",
    },
    {
        icon: (
            <div className="h-16 w-16 rounded-full border-0   flex items-center justify-center bg-[#E6F9FF]">
              <TrendingUp className="h-8 w-8 text-[#00C2FF]" />
            </div>
          ),
        title: "3. Get Smart Insights",
        description:"Get real-time insights into your spending. View charts, spot trends, and receive smart suggestions to save more and spend better",
    },
  ]