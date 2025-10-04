import React, { useState, useEffect } from "react";
import { getPnL } from "../services/api";

const PnLPage = () => {
  const [pnlSummary, setPnlSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const rawTotalPnL = pnlSummary.reduce(
    (sum, p) => sum + parseFloat(p.realized_pnl),
    0
  );
  const totalPnL = Math.round(rawTotalPnL * 10000) / 10000;
  const isTotalProfit = totalPnL >= 0;

  const totalPnLClasses = isTotalProfit
    ? "bg-green-100 text-green-800 border-green-300" // Profit
    : "bg-red-100 text-red-800 border-red-300"; // Loss
  useEffect(() => {
    setLoading(true);
    getPnL() // GET /pnl
      .then((response) => {
        setPnlSummary(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching P&L:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 pb-20">
      <header className="mb-10 w-full max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">
          Portfolio Performance
        </h1>
        <p className="text-xl text-orange-600 font-medium">
          Realized Profit & Loss Summary
        </p>
      </header>
      <main className="w-full max-w-3xl px-4">
        {loading ? (
          <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-md">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg text-gray-600">Calculating realized P&L...</p>
          </div>
        ) : (
          <>
            <div
              className={`p-6 mb-8 rounded-xl border-l-4 shadow-lg ${totalPnLClasses}`}
            >
              <p className="text-lg font-semibold mb-2">
                Total Portfolio Realized P&L
              </p>

              <div className="text-4xl font-extrabold">
                {isTotalProfit ? "▲ " : "▼ "}

                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }).format(totalPnL)}
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Realized P&L
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {pnlSummary.length > 0 ? (
                    pnlSummary.map((p, index) => {
                      const isProfit = p.realized_pnl >= 0;
                      const pnlColorClass = isProfit
                        ? "text-green-600"
                        : "text-red-600";
                      const sign = isProfit ? "+" : "-";

                      return (
                        <tr
                          key={p.symbol}
                          className={
                            index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50 hover:bg-gray-100 transition duration-150"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {p.symbol}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${pnlColorClass}`}
                          >
                            {`${sign}$${Math.abs(p.realized_pnl)
                              .toFixed(2)
                              .toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        className="px-6 py-12 text-center text-gray-500 italic"
                      >
                        No completed trades found to calculate realized P&L.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PnLPage;
