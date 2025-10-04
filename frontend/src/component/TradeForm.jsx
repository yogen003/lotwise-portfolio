import React, { useState } from "react";
import { postTrade } from "../services/api";

const TradeForm = () => {
  const [trade, setTrade] = useState({
    symbol: "",
    qty: "",
    price: "",
    timestamp: new Date().toISOString().substring(0, 16),
  });
  const [message, setMessage] = useState("");

  const messageClasses = message.includes("Failed")
    ? "text-red-700 bg-red-100"
    : "text-green-700 bg-green-100";
  const handleChange = (e) => {
    setTrade({ ...trade, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");

    try {
      await postTrade({
        ...trade,
        qty: parseFloat(trade.qty),
        price: parseFloat(trade.price),
      });
      setMessage("Trade submitted and queued successfully!");
      setTrade({ ...trade, symbol: "", qty: "", price: "" });
    } catch (error) {
      console.error("Error submitting trade:", error);
      setMessage("Failed to submit trade. Check console.");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="
                bg-white p-8 rounded-xl shadow-2xl 
                max-w-md w-full mx-auto space-y-5 
                border border-gray-100 mt-8
            "
      >
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
          Enter New Trade
        </h2>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Symbol:
            <input
              type="text"
              name="symbol"
              value={trade.symbol}
              onChange={handleChange}
              required
              placeholder="e.g., AAPL, TSLA"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Quantity:
            <p className="text-xs text-gray-500 mb-1">
              {" "}
              (Use positive for Buy, negative for Sell)
            </p>
            <input
              type="number"
              name="qty"
              value={trade.qty}
              onChange={handleChange}
              step="any"
              required
              placeholder="e.g., 100 or -50"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Price:
            <input
              type="number"
              name="price"
              value={trade.price}
              onChange={handleChange}
              step="0.01"
              required
              placeholder="0.00"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Timestamp:
            <input
              type="datetime-local"
              name="timestamp"
              value={trade.timestamp}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

        <button
          type="submit"
          className="
                    w-full py-3 px-4 mt-6 
                    bg-blue-600 hover:bg-blue-700 text-white 
                    font-semibold rounded-md shadow-lg 
                    transition duration-150 ease-in-out 
                    focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                "
        >
          Add Trade
        </button>

        {message && (
          <p
            className={`p-3 text-sm rounded-md font-medium text-center ${messageClasses}`}
          >
            {message}
          </p>
        )}
      </form>
    </>
  );
};

export default TradeForm;
