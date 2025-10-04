// src/pages/PortfolioApp.js
import { useState } from "react";
import pnl from "../pages/pnl";
import positions from "../pages/positions";
import TradeForm from "./TradeForm";

// Define the views and their titles for the Navbar
const views = {
  addTrade: { component: TradeForm, title: "Add Trade" },
  openPositions: { component: positions, title: "Open Positions" },
  pnlSummary: { component: pnl, title: "Realized P&L" },
};

const PortfolioApp = () => {
  const [activeView, setActiveView] = useState("addTrade");

  const ActiveComponent = views[activeView].component;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-10 bg-white shadow-lg">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-extrabold text-indigo-700">
                {" "}
                Portfolio Tracker 📈
              </span>
            </div>

            <div className="flex space-x-2 sm:space-x-4">
              {Object.keys(views).map((key) => {
                const { title } = views[key];
                const icon = {
                  addTrade: "➕",
                  openPositions: "📂",
                  pnlSummary: "💰",
                }[key];

                const isActive = activeView === key;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveView(key)}
                    className={`
                                px-3 py-2 rounded-md text-sm font-semibold transition duration-200 ease-in-out whitespace-nowrap
                                flex items-center space-x-1
                                ${
                                  isActive
                                    ? "bg-indigo-600 text-white shadow-md" // Active style
                                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" // Inactive style hover
                                }
                            `}
                  >
                    <span className="text-base">{icon}</span>{" "}
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>
            <div className="ml-auto flex items-center">
            </div>
          </div>
        </div>
      </nav>
      <main>
        <ActiveComponent />
      </main>
      <footer className="text-center mt-4 text-sm text-gray-400">
        Data entered here will update your real-time holdings.
      </footer>
    </div>
  );
};

export default PortfolioApp;
