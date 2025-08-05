"use client";

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { PlusCircle, MinusCircle, Trash2, Box, Store, CheckCircle, Download, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import Layout from '@/components/design/Layout';

// Helper function for Tailwind CSS class concatenation
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Reusable Button component (using React.forwardRef for proper ref handling)
const Button = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

// Reusable Input component (using React.forwardRef for proper ref handling)
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Main App component for the Inventory Dashboard
export default function App() {
  // State for active tab (stationery or merchandise)
  const [activeTab, setActiveTab] = useState('stationery');
  // States to store inventory items fetched from the API
  const [stationeryItems, setStationeryItems] = useState([]);
  const [merchandiseItems, setMerchandiseItems] = useState([]);

  // State for controlling the "Add New Item" modal visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // States for new item form inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(0);
  const [newItemReorderLevel, setNewItemReorderLevel] = useState(0);
  const [newItemPrice, setNewItemPrice] = useState(0);

  // Loading and error states for API calls
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Success message state for user feedback
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter state for stationery reorder alerts
  const [showReorderAlertFilter, setShowReorderAlertFilter] = useState(false);

  // Sort states for table columns
  const [sortBy, setSortBy] = useState(null); // Column to sort by ('name', 'quantity', etc.)
  const [sortOrder, setSortOrder] = useState('asc'); // Sort order ('asc' or 'desc')

  // State to track if XLSX library has been loaded dynamically
  const [isXLSXLoaded, setIsXLSXLoaded] = useState(false);

  // Function to display a success message temporarily
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000); // Message disappears after 3 seconds
    return () => clearTimeout(timer); // Cleanup function for useEffect
  };

  // Function to fetch inventory data from the backend API
  const fetchInventoryData = async () => {
    setIsLoading(true); // Set loading to true before fetching
    setError(null); // Clear any previous errors
    try {
      // Fetch stationery items
      const stationeryResponse = await fetch('http://localhost:5000/api/inventory/stationery');
      if (!stationeryResponse.ok) {
        const errorData = await stationeryResponse.json();
        throw new Error(errorData.message || 'Failed to fetch stationery items');
      }
      const stationeryData = await stationeryResponse.json();
      setStationeryItems(stationeryData);

      // Fetch merchandise items
      const merchandiseResponse = await fetch('http://localhost:5000/api/inventory/merchandise');
      if (!merchandiseResponse.ok) {
        const errorData = await merchandiseResponse.json();
        throw new Error(errorData.message || 'Failed to fetch merchandise items');
      }
      const merchandiseData = await merchandiseResponse.json();
      setMerchandiseItems(merchandiseData);

    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError(`Failed to load inventory data: ${err.message}. Please ensure your backend API is running.`);
    } finally {
      setIsLoading(false); // Set loading to false after fetching (success or error)
    }
  };

  // useEffect hook to fetch data on component mount and dynamically load XLSX library
  useEffect(() => {
    fetchInventoryData();

    // Dynamically load XLSX library if it's not already available globally
    if (typeof window !== 'undefined' && typeof window.XLSX === 'undefined') {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = () => {
        setIsXLSXLoaded(true);
        console.log("XLSX library loaded dynamically.");
      };
      script.onerror = () => {
        setError("Failed to load Excel export library. Please check your internet connection or try again.");
      };
      document.body.appendChild(script);

      return () => {
        // Clean up the script tag if the component unmounts
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else if (typeof window !== 'undefined' && typeof window.XLSX !== 'undefined') {
      setIsXLSXLoaded(true); // If already loaded (e.g., by another part of the app)
    }
  }, []); // Empty dependency array means this effect runs only once on mount

  // Handler for adding a new item (stationery or merchandise)
  const handleAddItem = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors
    setIsLoading(true); // Show loading during API call
    try {
      let response;
      if (activeTab === 'stationery') {
        // Basic validation for stationery
        if (!newItemName.trim() || newItemQuantity < 0 || newItemReorderLevel < 0) {
          throw new Error("Please provide valid data for stationery item.");
        }
        response = await fetch('http://localhost:5000/api/inventory/stationery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newItemName.trim(),
            quantity: parseInt(newItemQuantity),
            reorder_level: parseInt(newItemReorderLevel), // Ensure correct key for backend
          }),
        });
      } else if (activeTab === 'merchandise') {
        // Basic validation for merchandise
        if (!newItemName.trim() || newItemQuantity < 0 || newItemPrice < 0) {
          throw new Error("Please provide valid data for merchandise item.");
        }
        response = await fetch('http://localhost:5000/api/inventory/merchandise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newItemName.trim(),
            quantity: parseInt(newItemQuantity),
            price: parseFloat(newItemPrice).toFixed(2),
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add ${activeTab} item`);
      }

      await fetchInventoryData(); // Re-fetch all data to update the UI
      resetAddForm(); // Reset form fields and close modal
      showSuccessMessage(`${activeTab === 'stationery' ? 'Stationery' : 'Merchandise'} item added successfully!`);

    } catch (err) {
      console.error("Error adding item:", err);
      setError(`Failed to add item: ${err.message}.`);
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  // Function to reset the "Add New Item" form fields and close the modal
  const resetAddForm = () => {
    setNewItemName('');
    setNewItemQuantity(0);
    setNewItemReorderLevel(0);
    setNewItemPrice(0);
    setIsAddModalOpen(false); // Close the modal
  };

  // Handler for adjusting item quantity (increment or decrement)
  const adjustQuantity = async (type, id, delta) => {
    setError(null); // Clear previous errors
    setIsLoading(true); // Show loading during API call
    try {
      const currentItems = type === 'stationery' ? stationeryItems : merchandiseItems;
      const itemToUpdate = currentItems.find(item => item.id === id);

      if (itemToUpdate) {
        // Send 'delta' to backend; backend will calculate new quantity
        const endpoint = `http://localhost:5000/api/inventory/${type}/${id}/quantity`;

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta: delta }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update ${type} quantity`);
        }
        
        await fetchInventoryData(); // Re-fetch data to update UI
        showSuccessMessage("Quantity updated successfully!");
      }
    } catch (err) {
      console.error("Error adjusting quantity:", err);
      setError(`Failed to adjust quantity: ${err.message}.`);
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  // Handler for removing an item
  const removeItem = async (type, id) => {
    setError(null); // Clear previous errors
    setIsLoading(true); // Show loading during API call
    try {
      // Confirm deletion with the user
      if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
        setIsLoading(false);
        return;
      }

      const endpoint = `http://localhost:5000/api/inventory/${type}/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to remove ${type} item`);
      }
      
      await fetchInventoryData(); // Re-fetch data to update UI
      showSuccessMessage("Item removed successfully!");
    } catch (err) {
      console.error("Error removing item:", err);
      setError(`Failed to remove item: ${err.message}.`);
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  // Handler for exporting current tab data to Excel
  const handleExportToExcel = () => {
    // Ensure XLSX library is loaded before attempting export
    if (!isXLSXLoaded || typeof window.XLSX === 'undefined') {
      setError("Excel export library is still loading or failed to load. Please wait or refresh.");
      return;
    }

    const dataToExport = activeTab === 'stationery' ? stationeryItems : merchandiseItems;
    const sheetName = activeTab === 'stationery' ? 'Office Stationery' : 'Merchandise';
    const fileName = `${sheetName.replace(/\s/g, '_')}_Inventory.xlsx`;

    // Map data to a format suitable for Excel, adjusting keys for display headers
    const formattedData = dataToExport.map(item => {
      if (activeTab === 'stationery') {
        return {
          'Item Name': item.name,
          'Quantity': item.quantity,
          'Reorder Level': item.reorder_level, // Use reorder_level from DB
        };
      } else { // Merchandise
        return {
          'Item Name': item.name,
          'Quantity': item.quantity,
          'Price': `$${parseFloat(item.price).toFixed(2)}`, // Format price for display
        };
      }
    });

    // Create a new worksheet, append to a new workbook, and write to file
    const ws = window.XLSX.utils.json_to_sheet(formattedData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, sheetName);
    window.XLSX.writeFile(wb, fileName);

    showSuccessMessage(`Exported ${sheetName} data to Excel!`);
  };

  // Function to handle sorting when a column header is clicked
  const handleSort = (column) => {
    if (sortBy === column) {
      // If clicking the same column, toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new column, set it as sortBy and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Memoized function to filter and sort items based on current states
  const filteredAndSortedItems = React.useMemo(() => {
    let currentItems = activeTab === 'stationery' ? [...stationeryItems] : [...merchandiseItems]; // Create a copy to sort

    // Apply "Show Reorder Alerts" filter (only for stationery tab)
    if (activeTab === 'stationery' && showReorderAlertFilter) {
      currentItems = currentItems.filter(item => item.quantity <= item.reorder_level);
    }

    // Apply sorting logic
    if (sortBy) {
      currentItems.sort((a, b) => {
        let valA, valB;
        if (sortBy === 'name') { // Sort by name (alphabetical, case-insensitive)
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === 'quantity') { // Sort by quantity (numerical)
          valA = a.quantity;
          valB = b.quantity;
        } else if (sortBy === 'reorderLevel' && activeTab === 'stationery') { // Sort by reorder level (numerical, only for stationery)
          valA = a.reorder_level; // Use reorder_level from DB
          valB = b.reorder_level;
        } else if (sortBy === 'price' && activeTab === 'merchandise') { // Sort by price (numerical, only for merchandise)
          valA = parseFloat(a.price);
          valB = parseFloat(b.price);
        } else {
          return 0; // Fallback if sort column is not applicable to the current tab
        }

        // Perform comparison based on sort order
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0; // Items are equal
      });
    }

    return currentItems;
  }, [activeTab, stationeryItems, merchandiseItems, showReorderAlertFilter, sortBy, sortOrder]);

  return (
    <Layout>
      {/* Main container for the inventory dashboard */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white px-6 py-12 font-sans text-slate-800 w-full">
        {/* Tailwind CSS CDN for styling (included for standalone preview) */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Inter font for consistent typography (included for standalone preview) */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Custom styles for common elements to match the provided context (inline for convenience) */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: 'Inter', sans-serif; }
          .input { @apply flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50; }
          .btn-primary { @apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2; }
          .btn-secondary { @apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-200 text-gray-700 hover:bg-gray-300 h-10 px-4 py-2; }
        `}} />
        
        {/* Main content wrapper with white background and shadow */}
        <div className="bg-white p-8 rounded-lg shadow-xl w-full mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">Inventory Dashboard</h1>

          {/* Success Message Display */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4 flex items-center" role="alert">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Tab navigation for Stationery and Merchandise */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
            <div className="col-span-2 flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('stationery')}
                className={cn(
                  "px-6 py-3 text-lg font-medium rounded-t-lg transition-all",
                  activeTab === 'stationery' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100',
                  "flex-1" // Make tabs fill available space
                )}
                disabled={isLoading}
              >
                <Box className="inline-block mr-2 h-5 w-5" /> Office Stationery
              </button>
              <button
                onClick={() => setActiveTab('merchandise')}
                className={cn(
                  "px-6 py-3 text-lg font-medium rounded-t-lg transition-all",
                  activeTab === 'merchandise' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100',
                  "flex-1" // Make tabs fill available space
                )}
                disabled={isLoading}
              >
                <Store className="inline-block mr-2 h-5 w-5" /> Merchandise
              </button>
            </div>
          </div>

          {/* Sort & Filter Options and Action Buttons */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left side: Sort By and Show Reorder Alerts */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <Label.Root htmlFor="sortBy" className="text-sm font-medium text-gray-700">Sort By:</Label.Root>
                <select
                  id="sortBy"
                  value={sortBy || ''}
                  onChange={(e) => handleSort(e.target.value)}
                  className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  <option value="">None</option>
                  <option value="name">Item Name (A-Z)</option>
                  <option value="quantity">Quantity</option>
                  {activeTab === 'stationery' && <option value="reorderLevel">Reorder Level</option>}
                  {activeTab === 'merchandise' && <option value="price">Price</option>}
                </select>
                {sortBy && (
                  <Button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    disabled={isLoading}
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                )}
              </div>

              {/* Reorder Level Alert Filter (only for Stationery) */}
              {activeTab === 'stationery' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reorderAlert"
                    checked={showReorderAlertFilter}
                    onChange={(e) => setShowReorderAlertFilter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Label.Root htmlFor="reorderAlert" className="ml-2 block text-sm font-medium text-gray-700">
                    Show Reorder Alerts
                  </Label.Root>
                </div>
              )}
            </div>

            {/* Right side: Add New Item and Download Excel Buttons */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <Button onClick={() => setIsAddModalOpen(true)} className="btn-primary w-auto px-3 py-1.5 text-base rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105" disabled={isLoading}>
                <PlusCircle className="mr-1.5 h-4 w-4" /> Add Item
              </Button>
              <Button onClick={handleExportToExcel} className="btn-secondary bg-green-600 text-white hover:bg-green-700 w-auto px-3 py-1.5 text-base rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105" disabled={isLoading || filteredAndSortedItems.length === 0}>
                <Download className="mr-1.5 h-4 w-4" /> Download Excel
              </Button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <p className="text-center text-gray-600 py-8">Loading inventory data...</p>
          )}

          {/* Office Stationery Section Content */}
          {!isLoading && activeTab === 'stationery' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Office Stationery Stock</h2>
              {filteredAndSortedItems.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No stationery items found matching your criteria.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                          Item Name
                          {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="inline-block ml-1 h-4 w-4" /> : <ArrowDown className="inline-block ml-1 h-4 w-4" />)}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('quantity')}>
                          Quantity
                          {sortBy === 'quantity' && (sortOrder === 'asc' ? <ArrowUp className="inline-block ml-1 h-4 w-4" /> : <ArrowDown className="inline-block ml-1 h-4 w-4" />)}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('reorderLevel')}>
                          Reorder Level
                          {sortBy === 'reorderLevel' && (sortOrder === 'asc' ? <ArrowUp className="inline-block ml-1 h-4 w-4" /> : <ArrowDown className="inline-block ml-1 h-4 w-4" />)}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredAndSortedItems.map(item => (
                        <tr key={item.id} className={cn(
                          "hover:bg-gray-50 transition-colors",
                          item.quantity <= item.reorder_level ? 'bg-red-50' : '' // Highlight rows below reorder level
                        )}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => adjustQuantity('stationery', item.id, -1)}
                                className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                disabled={item.quantity <= 0 || isLoading}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold w-8 text-center">{item.quantity}</span>
                              <Button
                                onClick={() => adjustQuantity('stationery', item.id, 1)}
                                className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                                disabled={isLoading}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.reorder_level}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              onClick={() => removeItem('stationery', item.id)}
                              className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Merchandise Section Content */}
          {!isLoading && activeTab === 'merchandise' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Merchandise Stock</h2>
              {filteredAndSortedItems.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No merchandise items found matching your criteria.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                          Item Name
                          {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="inline-block ml-1 h-4 w-4" /> : <ArrowDown className="inline-block ml-1 h-4 w-4" />)}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('quantity')}>
                          Quantity
                          {sortBy === 'quantity' && (sortOrder === 'asc' ? <ArrowUp className="inline-block ml-1 h-4 w-4" /> : <ArrowDown className="inline-block ml-1 h-4 w-4" />)}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                          Price
                          {sortBy === 'price' && (sortOrder === 'asc' ? <ArrowUp className="inline-block ml-1 h-4 w-4" /> : <ArrowDown className="inline-block ml-1 h-4 w-4" />)}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredAndSortedItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => adjustQuantity('merchandise', item.id, -1)}
                                className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                disabled={item.quantity <= 0 || isLoading}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold w-8 text-center">{item.quantity}</span>
                              <Button
                                onClick={() => adjustQuantity('merchandise', item.id, 1)}
                                className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                                disabled={isLoading}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${parseFloat(item.price).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              onClick={() => removeItem('merchandise', item.id)}
                              className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Add New Item Modal using Radix UI Dialog */}
          <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
              <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-8 shadow-[hsl(206_22%7%/35%)_0px_10px_38px-10px,hsl(206_22%_7%/20%)_0px_10px_20px-15px] focus:outline-none z-50">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">Add New {activeTab === 'stationery' ? 'Stationery' : 'Merchandise'} Item</Dialog.Title>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <Label.Root htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Item Name</Label.Root>
                    <Input
                      type="text"
                      id="itemName"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label.Root htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</Label.Root>
                    <Input
                      type="number"
                      id="itemQuantity"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      min="0"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {activeTab === 'stationery' && (
                    <div>
                      <Label.Root htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</Label.Root>
                      <Input
                        type="number"
                        id="reorderLevel"
                        value={newItemReorderLevel}
                        onChange={(e) => setNewItemReorderLevel(e.target.value)}
                        min="0"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  {activeTab === 'merchandise' && (
                    <div>
                      <Label.Root htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 mb-1">Price</Label.Root>
                      <Input
                        type="number"
                        id="itemPrice"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      type="button"
                      onClick={resetAddForm}
                      className="btn-secondary px-4 py-2"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="btn-primary px-4 py-2"
                      disabled={isLoading}
                    >
                      Add Item
                    </Button>
                  </div>
                </form>
                <Dialog.Close asChild>
                  <button
                    className="text-gray-500 hover:bg-gray-100 focus:shadow-blue-500 absolute top-3 right-3 inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                    aria-label="Close"
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </Layout>
  );
}
