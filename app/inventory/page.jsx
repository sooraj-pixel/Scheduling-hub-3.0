'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { PlusCircle, MinusCircle, Trash2, Box, Store, CheckCircle, Download, ArrowUp, ArrowDown, ArrowLeftCircle, RefreshCcw, PencilLine, Info } from 'lucide-react';
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

export default function InventoryApp() {
  const [activeTab, setActiveTab] = useState('stationery');
  const [stationeryItems, setStationeryItems] = useState([]);
  const [merchandiseItems, setMerchandiseItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(0);
  const [newItemReorderLevel, setNewItemReorderLevel] = useState(0);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showReorderAlertFilter, setShowReorderAlertFilter] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [isXLSXLoaded, setIsXLSXLoaded] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemQuantity, setEditItemQuantity] = useState(0);
  const [editItemReorderLevel, setEditItemReorderLevel] = useState(0);
  const [editItemPrice, setEditItemPrice] = useState(0);

  // New state for the info modal
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoItem, setInfoItem] = useState(null);


  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  // Mock data to be used if no data is found in local storage
  const initialStationery = [
    { id: 1, name: "Pens", quantity: 15, reorder_level: 20 },
    { id: 2, name: "Notebooks", quantity: 5, reorder_level: 10 },
    { id: 3, name: "Staples", quantity: 50, reorder_level: 100 },
  ];
  const initialMerchandise = [
    { id: 1, name: "T-Shirt", quantity: 20, price: "15.99" },
    { id: 2, name: "Mug", quantity: 5, price: "9.99" },
  ];

  // Effect to load data from localStorage on initial component mount
  useEffect(() => {
    try {
      const storedStationery = localStorage.getItem('stationeryInventory');
      const storedMerchandise = localStorage.getItem('merchandiseInventory');

      if (storedStationery) {
        setStationeryItems(JSON.parse(storedStationery));
      } else {
        setStationeryItems(initialStationery);
      }

      if (storedMerchandise) {
        setMerchandiseItems(JSON.parse(storedMerchandise));
      } else {
        setMerchandiseItems(initialMerchandise);
      }
    } catch (e) {
      console.error("Error loading from localStorage", e);
      setError("Failed to load saved data. Using default inventory.");
      setStationeryItems(initialStationery);
      setMerchandiseItems(initialMerchandise);
    } finally {
      setIsLoading(false);
    }

    // Load the XLSX library for Excel export
    if (typeof window !== 'undefined' && typeof window.XLSX === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload = () => {
            setIsXLSXLoaded(true);
        };
        script.onerror = () => {
            setError("Failed to load Excel export library. Please check your internet connection or try again.");
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    } else if (typeof window !== 'undefined' && typeof window.XLSX !== 'undefined') {
        setIsXLSXLoaded(true);
    }
  }, []);

  // Effect to save data to localStorage whenever stationeryItems or merchandiseItems changes
  useEffect(() => {
    if (stationeryItems.length > 0) {
      localStorage.setItem('stationeryInventory', JSON.stringify(stationeryItems));
    }
    if (merchandiseItems.length > 0) {
      localStorage.setItem('merchandiseInventory', JSON.stringify(merchandiseItems));
    }
  }, [stationeryItems, merchandiseItems]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (activeTab === 'stationery') {
        if (!newItemName.trim() || newItemQuantity < 0 || newItemReorderLevel < 0) {
            throw new Error("Please provide valid data for stationery item.");
        }
        const newId = stationeryItems.length > 0 ? Math.max(...stationeryItems.map(item => item.id)) + 1 : 1;
        setStationeryItems(prev => [...prev, { id: newId, name: newItemName.trim(), quantity: parseInt(newItemQuantity), reorder_level: parseInt(newItemReorderLevel) }]);
      } else if (activeTab === 'merchandise') {
        if (!newItemName.trim() || newItemQuantity < 0 || newItemPrice < 0) {
            throw new Error("Please provide valid data for merchandise item.");
        }
        const newId = merchandiseItems.length > 0 ? Math.max(...merchandiseItems.map(item => item.id)) + 1 : 1;
        setMerchandiseItems(prev => [...prev, { id: newId, name: newItemName.trim(), quantity: parseInt(newItemQuantity), price: parseFloat(newItemPrice).toFixed(2) }]);
      }

      resetAddForm();
      showSuccessMessage(`${activeTab === 'stationery' ? 'Stationery' : 'Merchandise'} item added successfully!`);
    } catch (err) {
      console.error("Error adding item:", err);
      setError(`Failed to add item: ${err.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAddForm = () => {
    setNewItemName('');
    setNewItemQuantity(0);
    setNewItemReorderLevel(0);
    setNewItemPrice(0);
    setIsAddModalOpen(false);
  };
  
  // Function to open the edit modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemQuantity(item.quantity);
    if (activeTab === 'stationery') {
        setEditItemReorderLevel(item.reorder_level);
    } else {
        setEditItemPrice(item.price);
    }
    setIsEditModalOpen(true);
  };

  // Function to handle saving the edited item
  const handleEditItem = (e) => {
    e.preventDefault();
    setError(null);

    const updateItemInList = (items) => {
        return items.map(item => {
            if (item.id === editingItem.id) {
                const updatedItem = {
                    ...item,
                    name: editItemName.trim(),
                    quantity: parseInt(editItemQuantity),
                };
                if (activeTab === 'stationery') {
                    updatedItem.reorder_level = parseInt(editItemReorderLevel);
                } else {
                    updatedItem.price = parseFloat(editItemPrice).toFixed(2);
                }
                return updatedItem;
            }
            return item;
        });
    };

    if (activeTab === 'stationery') {
        setStationeryItems(prevItems => updateItemInList(prevItems));
    } else {
        setMerchandiseItems(prevItems => updateItemInList(prevItems));
    }

    setIsEditModalOpen(false);
    setEditingItem(null);
    showSuccessMessage(`${editingItem.name} updated successfully!`);
  };

  // Function to open the info modal
  const openInfoModal = (item) => {
    setInfoItem(item);
    setIsInfoModalOpen(true);
  };

  const adjustQuantity = async (type, id, delta) => {
    setError(null);
    const setFunction = type === 'stationery' ? setStationeryItems : setMerchandiseItems;
    setFunction(prevItems => prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
    showSuccessMessage("Quantity updated successfully!");
  };

  const handleRemoveItemWithConfirm = (type, item) => {
    setItemToDelete({ type, id: item.id, name: item.name });
    setIsConfirmModalOpen(true);
  };

  const removeItem = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    setError(null);
    const setFunction = type === 'stationery' ? setStationeryItems : setMerchandiseItems;
    setFunction(prevItems => prevItems.filter(item => item.id !== id));
    showSuccessMessage("Item removed successfully!");
    setIsConfirmModalOpen(false);
    setItemToDelete(null);
  };

  const resetInventory = () => {
    localStorage.removeItem('stationeryInventory');
    localStorage.removeItem('merchandiseInventory');
    setStationeryItems(initialStationery);
    setMerchandiseItems(initialMerchandise);
    setIsResetConfirmModalOpen(false);
    showSuccessMessage("Inventory has been reset to default values.");
  };

  const handleExportToExcel = () => {
    if (!isXLSXLoaded || typeof window.XLSX === 'undefined') {
        setError("Excel export library is still loading or failed to load. Please wait or refresh.");
        return;
    }

    const dataToExport = activeTab === 'stationery' ? stationeryItems : merchandiseItems;
    const sheetName = activeTab === 'stationery' ? 'Office Stationery' : 'Merchandise';
    const fileName = `${sheetName.replace(/\s/g, '_')}_Inventory.xlsx`;
    const formattedData = dataToExport.map(item => {
        if (activeTab === 'stationery') {
            return {
                'Item Name': item.name,
                'Quantity': item.quantity,
                'Reorder Level': item.reorder_level,
            };
        } else {
            return {
                'Item Name': item.name,
                'Quantity': item.quantity,
                'Price': `$${parseFloat(item.price).toFixed(2)}`,
            };
        }
    });
    const ws = window.XLSX.utils.json_to_sheet(formattedData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, sheetName);
    window.XLSX.writeFile(wb, fileName);
    showSuccessMessage(`Exported ${sheetName} data to Excel!`);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let currentItems = activeTab === 'stationery' ? [...stationeryItems] : [...merchandiseItems];
    if (activeTab === 'stationery' && showReorderAlertFilter) {
      currentItems = currentItems.filter(item => item.quantity <= item.reorder_level);
    }
    if (sortBy) {
        currentItems.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else if (sortBy === 'quantity') {
                valA = a.quantity;
                valB = b.quantity;
            } else if (sortBy === 'reorderLevel' && activeTab === 'stationery') {
                valA = a.reorder_level;
                valB = b.reorder_level;
            } else if (sortBy === 'price' && activeTab === 'merchandise') {
                valA = parseFloat(a.price);
                valB = parseFloat(b.price);
            } else {
                return 0;
            }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return currentItems;
  }, [activeTab, stationeryItems, merchandiseItems, showReorderAlertFilter, sortBy, sortOrder]);


  const ConfirmModal = ({ isOpen, onClose, onConfirm, item, title, description, confirmText = "Delete" }) => {
      return (
          <Dialog.Root open={isOpen} onOpenChange={onClose}>
              <Dialog.Portal>
                  <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
                  <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-[hsl(206_22%7%/35%)_0px_10px_38px-10px,hsl(206_22%_7%/20%)_0px_10px_20px-15px] focus:outline-none z-50">
                      <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">{title}</Dialog.Title>
                      <Dialog.Description className="text-gray-700 mb-6">
                          {description}
                      </Dialog.Description>
                      <div className="flex justify-end space-x-3">
                          <Button onClick={onClose} className="btn-secondary">Cancel</Button>
                          <Button onClick={onConfirm} className={cn("btn-primary", confirmText === "Delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700")}>{confirmText}</Button>
                      </div>
                  </Dialog.Content>
              </Dialog.Portal>
          </Dialog.Root>
      );
  };

  return (
    <Layout>
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: 'Inter', sans-serif; }
        .input { @apply flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50; }
        .btn-primary { @apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2; }
        .btn-secondary { @apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-200 text-gray-700 hover:bg-gray-300 h-10 px-4 py-2; }
      `}} />

      <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-50 to-white px-6 py-12 font-sans text-slate-800">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
              <Button onClick={() => window.history.back()} className="btn-secondary px-3 py-2">
                  <ArrowLeftCircle className="mr-2 h-4 w-4" /> Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 flex-grow text-center">Inventory Dashboard</h1>
              <Button
                onClick={() => setIsResetConfirmModalOpen(true)}
                className="btn-secondary px-3 py-2 bg-yellow-500 text-white hover:bg-yellow-600"
                disabled={isLoading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
          </div>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4 flex items-center" role="alert">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
            <div className="col-span-2 flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('stationery')}
                className={cn(
                  "px-6 py-3 text-lg font-medium rounded-t-lg transition-all",
                  activeTab === 'stationery' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100',
                  "flex-1"
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
                  "flex-1"
                )}
                disabled={isLoading}
              >
                <Store className="inline-block mr-2 h-5 w-5" /> Merchandise
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
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

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <Button onClick={() => setIsAddModalOpen(true)} className="btn-primary w-auto px-3 py-1.5 text-base rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105" disabled={isLoading}>
                <PlusCircle className="mr-1.5 h-4 w-4" /> Add Item
              </Button>
              <Button onClick={handleExportToExcel} className="btn-secondary bg-green-600 text-white hover:bg-green-700 w-auto px-3 py-1.5 text-base rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105" disabled={isLoading || filteredAndSortedItems.length === 0}>
                <Download className="mr-1.5 h-4 w-4" /> Download Excel
              </Button>
            </div>
          </div>

          {isLoading && (
            <p className="text-center text-gray-600 py-8">Loading inventory data...</p>
          )}

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
                                        item.quantity <= item.reorder_level ? 'bg-red-50' : ''
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
                                            <div className="flex items-center justify-end space-x-2">
                                              <Button
                                                  onClick={() => openInfoModal(item)}
                                                  className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                  disabled={isLoading}
                                              >
                                                  <Info className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                  onClick={() => openEditModal(item)}
                                                  className="p-1.5 rounded-full bg-gray-100 text-blue-600 hover:bg-gray-200"
                                                  disabled={isLoading}
                                              >
                                                  <PencilLine className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                  onClick={() => handleRemoveItemWithConfirm('stationery', item)}
                                                  className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                  disabled={isLoading}
                                              >
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          )}

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
                                          <div className="flex items-center justify-end space-x-2">
                                              <Button
                                                  onClick={() => openInfoModal(item)}
                                                  className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                  disabled={isLoading}
                                              >
                                                  <Info className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                  onClick={() => openEditModal(item)}
                                                  className="p-1.5 rounded-full bg-gray-100 text-blue-600 hover:bg-gray-200"
                                                  disabled={isLoading}
                                              >
                                                  <PencilLine className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                  onClick={() => handleRemoveItemWithConfirm('merchandise', item)}
                                                  className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                  disabled={isLoading}
                                              >
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                          </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          )}

          {/* Add Item Modal */}
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

          {/* Edit Item Modal */}
          <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
              <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-8 shadow-[hsl(206_22%7%/35%)_0px_10px_38px-10px,hsl(206_22%_7%/20%)_0px_10px_20px-15px] focus:outline-none z-50">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">Edit {editingItem?.name}</Dialog.Title>
                <form onSubmit={handleEditItem} className="space-y-4">
                  <div>
                    <Label.Root htmlFor="editItemName" className="block text-sm font-medium text-gray-700 mb-1">Item Name</Label.Root>
                    <Input
                      type="text"
                      id="editItemName"
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label.Root htmlFor="editItemQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</Label.Root>
                    <Input
                      type="number"
                      id="editItemQuantity"
                      value={editItemQuantity}
                      onChange={(e) => setEditItemQuantity(e.target.value)}
                      min="0"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {activeTab === 'stationery' && (
                    <div>
                      <Label.Root htmlFor="editReorderLevel" className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</Label.Root>
                      <Input
                        type="number"
                        id="editReorderLevel"
                        value={editItemReorderLevel}
                        onChange={(e) => setEditItemReorderLevel(e.target.value)}
                        min="0"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  {activeTab === 'merchandise' && (
                    <div>
                      <Label.Root htmlFor="editItemPrice" className="block text-sm font-medium text-gray-700 mb-1">Price</Label.Root>
                      <Input
                        type="number"
                        id="editItemPrice"
                        value={editItemPrice}
                        onChange={(e) => setEditItemPrice(e.target.value)}
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
                      onClick={() => setIsEditModalOpen(false)}
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
                      Save Changes
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

          {/* Info Modal */}
          <Dialog.Root open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
              <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-8 shadow-[hsl(206_22%7%/35%)_0px_10px_38px-10px,hsl(206_22%_7%/20%)_0px_10px_20px-15px] focus:outline-none z-50">
                <Dialog.Title className="text-2xl font-bold text-gray-900 mb-4">{infoItem?.name} Details</Dialog.Title>
                {infoItem && (
                  <div className="space-y-4">
                    <img
                      src={`https://placehold.co/400x200/e0e0e0/000000?text=${encodeURIComponent(infoItem.name)}`}
                      alt={`Image of ${infoItem.name}`}
                      className="rounded-md w-full h-auto object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Item Name:</p>
                      <p className="text-lg font-semibold text-gray-900">{infoItem.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Current Quantity:</p>
                      <p className="text-lg font-semibold text-gray-900">{infoItem.quantity}</p>
                    </div>
                    {activeTab === 'stationery' && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Reorder Level:</p>
                        <p className="text-lg font-semibold text-gray-900">{infoItem.reorder_level}</p>
                        {infoItem.quantity <= infoItem.reorder_level && (
                          <p className="text-red-500 font-bold mt-2">Alert: Quantity is at or below the reorder level!</p>
                        )}
                      </div>
                    )}
                    {activeTab === 'merchandise' && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Price:</p>
                        <p className="text-lg font-semibold text-gray-900">${parseFloat(infoItem.price).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setIsInfoModalOpen(false)}
                    className="btn-secondary px-4 py-2"
                  >
                    Close
                  </Button>
                </div>
                <Dialog.Close asChild>
                  <button
                    className="text-gray-500 hover:bg-gray-100 focus:shadow-blue-500 absolute top-3 right-3 inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>


          <ConfirmModal
              isOpen={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={removeItem}
              item={itemToDelete}
              title="Confirm Deletion"
              description={`Are you sure you want to delete the item "${itemToDelete?.name}"? This action cannot be undone.`}
              confirmText="Delete"
          />

          <ConfirmModal
              isOpen={isResetConfirmModalOpen}
              onClose={() => setIsResetConfirmModalOpen(false)}
              onConfirm={resetInventory}
              title="Reset Inventory"
              description="Are you sure you want to reset all inventory data? This will delete all your saved changes and restore the default inventory. This action cannot be undone."
              confirmText="Reset"
          />
        </div>
      </div>
    </Layout>
  );
}
