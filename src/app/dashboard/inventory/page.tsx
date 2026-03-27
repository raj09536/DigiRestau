'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import { 
  Package, 
  Link as LinkIcon, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Smartphone,
  Download,
  FileText,
  Table as TableIcon,
  ChevronRight,
  Zap,
  Hand
} from 'lucide-react';
import { toast } from 'sonner';
import { InventoryItem, StockTransaction, InventoryMenuLink, Supplier, MenuItem } from '@/lib/types';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import './inventory.css';

export default function InventoryPage() {
  const { restaurant } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'stock' | 'links' | 'suppliers' | 'reports'>('stock');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Data states
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [links, setLinks] = useState<InventoryMenuLink[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  // Modal states
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedMenuitem, setSelectedMenuItem] = useState<any>(null);

  // Form states
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState(0);
  const [minPercent, setMinPercent] = useState(20);
  const [quantityToAdd, setQuantityToAdd] = useState(0);
  const [stockNote, setStockNote] = useState('');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState('');
  const [quantityUsed, setQuantityUsed] = useState(0);
  const [isAutoDeduct, setIsAutoDeduct] = useState(true);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierItems, setSupplierItems] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');

  useEffect(() => {
    if (restaurant?.id) {
      fetchAllData();
    }
  }, [restaurant]);

  const fetchAllData = async () => {
    setLoading(true);
    const rid = restaurant?.id;
    
    // Fetch Inventory Items
    const { data: itemsData } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('restaurant_id', rid)
      .order('name');
    setItems(itemsData || []);

    // Fetch Menu Items
    const { data: menuData } = await supabase
      .from('menu_items')
      .select('*, menu_categories(name)')
      .eq('restaurant_id', rid);
    setMenuItems(menuData || []);

    // Fetch Links
    const { data: linksData } = await supabase
      .from('inventory_menu_links')
      .select('*, inventory_items(name, unit)')
      .eq('restaurant_id', rid);
    setLinks(linksData || []);

    // Fetch Suppliers
    const { data: suppliersData } = await supabase
      .from('suppliers')
      .select('*')
      .eq('restaurant_id', rid);
    setSuppliers(suppliersData || []);

    // Fetch Transactions
    const { data: transData } = await supabase
      .from('stock_transactions')
      .select('*, inventory_items(name, unit)')
      .eq('restaurant_id', rid)
      .order('created_at', { ascending: false });
    setTransactions(transData || []);

    setLoading(false);
  };

  const handleAddItem = async () => {
    if (!itemName) return toast.error('Item name is required');
    const minLevel = (currentStock * minPercent) / 100;
    
    const { error } = await supabase
      .from('inventory_items')
      .insert({
        restaurant_id: restaurant?.id,
        name: itemName,
        unit: unit,
        current_stock: currentStock,
        min_stock_percent: minPercent,
        min_stock_level: minLevel,
        is_low_stock: currentStock <= minLevel
      });

    if (error) toast.error(error.message);
    else {
      toast.success('Item added successfully');
      setIsAddItemModalOpen(false);
      fetchAllData();
      // Reset form
      setItemName('');
      setCurrentStock(0);
    }
  };

  const handleAddStock = async () => {
    if (!selectedItem || quantityToAdd <= 0) return;
    const newStock = selectedItem.current_stock + quantityToAdd;
    const isLow = newStock <= selectedItem.min_stock_level;

    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        current_stock: newStock,
        is_low_stock: isLow
      })
      .eq('id', selectedItem.id);

    if (updateError) return toast.error(updateError.message);

    await supabase
      .from('stock_transactions')
      .insert({
        restaurant_id: restaurant?.id,
        inventory_item_id: selectedItem.id,
        type: 'add',
        quantity: quantityToAdd,
        note: stockNote || 'Manual Add'
      });

    toast.success('Stock updated');
    setIsAddStockModalOpen(false);
    setQuantityToAdd(0);
    setStockNote('');
    fetchAllData();
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) toast.error(error.message);
    else fetchAllData();
  };

  const handleAddLink = async () => {
    if (!selectedMenuitem || !selectedInventoryItem || quantityUsed <= 0) return;
    
    const { error } = await supabase
      .from('inventory_menu_links')
      .insert({
        restaurant_id: restaurant?.id,
        menu_item_id: selectedMenuitem.id,
        inventory_item_id: selectedInventoryItem,
        quantity_used: quantityUsed,
        is_auto_deduct: isAutoDeduct
      });

    if (error) toast.error(error.message);
    else {
      toast.success('Link saved');
      setIsLinkModalOpen(false);
      fetchAllData();
    }
  };

  const handleDeleteLink = async (id: string) => {
    await supabase.from('inventory_menu_links').delete().eq('id', id);
    fetchAllData();
  };

  const handleAddSupplier = async () => {
    if (!supplierName || !supplierPhone) return;
    
    const { error } = await supabase
      .from('suppliers')
      .insert({
        restaurant_id: restaurant?.id,
        name: supplierName,
        phone: supplierPhone,
        items: supplierItems,
        notes: supplierNotes
      });

    if (error) toast.error(error.message);
    else {
      toast.success('Supplier saved');
      setIsSupplierModalOpen(false);
      fetchAllData();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Inventory Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Restaurant: ${restaurant?.name}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    
    let y = 50;
    doc.text('Date', 20, y);
    doc.text('Item', 60, y);
    doc.text('Type', 100, y);
    doc.text('Quantity', 140, y);
    doc.text('Note', 170, y);
    doc.line(20, y+2, 200, y+2);
    
    y += 10;
    transactions.slice(0, 20).forEach(t => {
      doc.text(new Date(t.created_at).toLocaleDateString(), 20, y);
      doc.text((t as any).inventory_items?.name || 'N/A', 60, y);
      doc.text(t.type, 100, y);
      doc.text(`${t.quantity} ${(t as any).inventory_items?.unit}`, 140, y);
      doc.text(t.note || '-', 170, y);
      y += 8;
    });

    doc.save('inventory-report.pdf');
  };

  const exportExcel = () => {
    const data = transactions.map(t => ({
      Date: new Date(t.created_at).toLocaleString(),
      Item: (t as any).inventory_items?.name,
      Type: t.type,
      Quantity: t.quantity,
      Unit: (t as any).inventory_items?.unit,
      Note: t.note
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'inventory-report.xlsx');
  };


  const lowStockItems = items.filter(i => i.is_low_stock);

  return (
    <div className="inventory-container animate-fade-in">
      {/* Tabs */}
      <div className="inventory-tabs">
        <button 
          className={`inventory-tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <Package className="w-4 h-4" /> 📦 Stock
        </button>
        <button 
          className={`inventory-tab-btn ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <LinkIcon className="w-4 h-4" /> 🔗 Menu Links
        </button>
        <button 
          className={`inventory-tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          <Users className="w-4 h-4" /> 🏪 Suppliers
        </button>
        <button 
          className={`inventory-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <BarChart3 className="w-4 h-4" /> 📊 Reports
        </button>
      </div>

      {/* TAB 1: STOCK */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="inventory-header">
            <div>
              <h2>Inventory</h2>
              <p className="text-text-muted text-sm mt-1">Manage your raw materials and ingredients</p>
            </div>
            <button className="saffron-btn flex items-center gap-2" onClick={() => setIsAddItemModalOpen(true)}>
              <Plus className="w-5 h-5" /> Add Item
            </button>
          </div>

          {lowStockItems.length > 0 && (
            <div className="low-stock-alert">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{lowStockItems.length} items low stock mein hain:</span>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(i => (
                  <span key={i.id} className="low-item-badge">{i.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <div key={item.id} className={`inventory-card ${item.is_low_stock ? 'low-stock' : ''}`}>
                {item.is_low_stock && (
                  <span className="low-badge">⚠️ Low Stock</span>
                )}
                <h3 className="item-name">{item.name}</h3>
                <div className="stock-display">
                  <span className="stock-num">{item.current_stock}</span>
                  <span className="stock-unit">{item.unit}</span>
                </div>
                <div className="stock-bar">
                  <div 
                    className="stock-fill"
                    style={{
                      width: `${Math.min(100, (item.current_stock / (item.min_stock_level * 5)) * 100)}%`,
                      background: item.is_low_stock ? '#FF5757' : '#4CAF7D'
                    }}
                  />
                </div>
                <p className="stock-min">
                  Min level: {item.min_stock_level.toFixed(2)} {item.unit}
                </p>
                <div className="item-actions">
                  <button onClick={() => { setSelectedItem(item); setIsAddStockModalOpen(true); }}>
                    <Plus className="w-4 h-4" /> Stock
                  </button>
                  <button onClick={() => { setSelectedItem(item); setIsAddItemModalOpen(true); }}>
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {items.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <span className="text-4xl block mb-4">📦</span>
                <p className="text-text-muted">No inventory items found. Add some ingredients to start tracking.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MENU LINKS */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          <div className="inventory-header">
            <div>
              <h2>Menu Links</h2>
              <p className="text-text-muted text-sm mt-1">Link menu items to inventory for auto-deduction</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map(menuItem => {
              const itemLinks = links.filter(l => l.menu_item_id === menuItem.id);
              return (
                <div key={menuItem.id} className="menu-link-card">
                  <div className="menu-item-info">
                    <span className="menu-item-name">{menuItem.name}</span>
                    <span className="menu-category">{menuItem.menu_categories?.name}</span>
                  </div>
                  <div className="linked-ingredients">
                    {itemLinks.length > 0 ? (
                      itemLinks.map(link => (
                        <div key={link.id} className="ingredient-tag">
                          {link.inventory_items?.name} — {link.quantity_used} {link.inventory_items?.unit}
                          <span className={`auto-badge ${link.is_auto_deduct ? 'auto' : 'manual'}`}>
                            {link.is_auto_deduct ? <Zap className="w-2.5 h-2.5 inline" /> : <Hand className="w-2.5 h-2.5 inline" />} {link.is_auto_deduct ? 'Auto' : 'Manual'}
                          </span>
                          <button className="ml-2 hover:text-red-400" onClick={() => handleDeleteLink(link.id)}>✕</button>
                        </div>
                      ))
                    ) : (
                      <span className="text-text-muted text-xs italic">No ingredients linked</span>
                    )}
                  </div>
                  <button 
                    className="w-full py-3 rounded-xl border border-dashed border-white/10 text-xs font-bold text-text-muted hover:text-saffron hover:border-saffron/30 transition-all flex items-center justify-center gap-2"
                    onClick={() => { setSelectedMenuItem(menuItem); setIsLinkModalOpen(true); }}
                  >
                    <Plus className="w-4 h-4" /> Link Ingredient
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="inventory-header">
            <div>
              <h2>Suppliers</h2>
              <p className="text-text-muted text-sm mt-1">Manage your supply network</p>
            </div>
            <button className="saffron-btn flex items-center gap-2" onClick={() => setIsSupplierModalOpen(true)}>
              <Plus className="w-5 h-5" /> Add Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="supplier-card">
                <h3 className="font-fraunces text-xl mb-4">{supplier.name}</h3>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-text-muted flex items-center gap-2"><Smartphone className="w-4 h-4" /> {supplier.phone}</p>
                  <p className="text-sm text-text-muted flex items-center gap-2"><Package className="w-4 h-4" /> {supplier.items}</p>
                  {supplier.notes && <p className="text-sm text-text-muted italic flex items-center gap-2"><FileText className="w-4 h-4" /> {supplier.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`https://wa.me/91${supplier.phone}?text=Namaste ${supplier.name}! Stock order karna hai.`}
                    target="_blank"
                    className="whatsapp-btn flex-1"
                  >
                    📱 WhatsApp Order
                  </a>
                  <button onClick={() => { setIsSupplierModalOpen(true); setSupplierName(supplier.name); setSupplierPhone(supplier.phone); setSupplierItems(supplier.items); setSupplierNotes(supplier.notes || ''); }} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="inventory-header">
            <div>
              <h2>Inventory Reports</h2>
              <p className="text-text-muted text-sm mt-1">Track usage and wastage trends</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-white/10" onClick={exportPDF}>
                <FileText className="w-4 h-4" /> Export PDF
              </button>
              <button className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-white/10" onClick={exportExcel}>
                <TableIcon className="w-4 h-4" /> Export Excel
              </button>
            </div>
          </div>

          <div className="report-summary-grid">
            <div className="summary-card">
              <span className="summary-label">📦 Stock Added</span>
              <span className="summary-value text-green-400">
                {transactions.filter(t => t.type === 'add').reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">📉 Stock Used</span>
              <span className="summary-value text-saffron">
                {transactions.filter(t => t.type === 'deduct').reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">🗑 Waste</span>
              <span className="summary-value text-red-400">
                {transactions.filter(t => t.type === 'waste').reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">⚠️ Low Stock Alerts</span>
              <span className="summary-value text-yellow-400">
                {items.filter(i => i.is_low_stock).length} active
              </span>
            </div>
          </div>

          <div className="transaction-table-container">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className="text-text-muted">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="font-bold">{t.inventory_items?.name}</td>
                    <td>
                      <span className={`type-badge ${t.type}`}>
                        {t.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-bold text-text-main">
                      {t.type === 'add' || t.type === 'cancel_refund' ? '+' : '-'} {t.quantity} {t.inventory_items?.unit}
                    </td>
                    <td className="text-text-muted italic">{t.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals (Basic implementation) */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="modal-content w-full max-w-md animate-pop-in">
            <h2 className="text-2xl font-fraunces mb-6">Add Inventory Item</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-2">Item Name</label>
                <input 
                  type="text" 
                  value={itemName} 
                  onChange={e => setItemName(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main focus:border-saffron/50 outline-none"
                  placeholder="e.g. Saffron, Rice, Milk"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-2">Unit</label>
                <select 
                  value={unit} 
                  onChange={e => setUnit(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main focus:border-saffron/50 outline-none"
                >
                  <option value="kg">kilogram (kg)</option>
                  <option value="g">gram (g)</option>
                  <option value="L">liter (L)</option>
                  <option value="ml">milliliter (ml)</option>
                  <option value="piece">piece</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-2">Current Stock</label>
                  <input 
                    type="number" 
                    value={currentStock} 
                    onChange={e => setCurrentStock(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-2">Low Stock % ({minPercent}%)</label>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={minPercent} 
                    onChange={e => setMinPercent(Number(e.target.value))}
                    className="w-full mt-4"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 saffron-btn" onClick={handleAddItem}>Save Item</button>
                <button className="px-6 py-3 rounded-xl bg-white/5 text-text-muted font-bold" onClick={() => setIsAddItemModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddStockModalOpen && selectedItem && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-content w-full max-w-md">
            <h2 className="text-2xl font-fraunces mb-2">Stock Add Karo</h2>
            <p className="text-text-muted text-sm mb-6">{selectedItem.name} — Current: {selectedItem.current_stock} {selectedItem.unit}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-1">Quantity to Add</label>
                <input 
                  type="number" 
                  value={quantityToAdd} 
                  onChange={e => setQuantityToAdd(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-1">Note (Optional)</label>
                <input 
                  type="text" 
                  value={stockNote} 
                  onChange={e => setStockNote(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none"
                  placeholder="e.g. Supplier se aaya"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/20" onClick={handleAddStock}>Add Stock</button>
                <button className="px-6 py-3 rounded-xl bg-white/5 text-text-muted font-bold" onClick={() => setIsAddStockModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLinkModalOpen && selectedMenuitem && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 modal-overlay">
          <div className="modal-content w-full max-w-md">
            <h2 className="text-2xl font-fraunces mb-2">Ingredient Link Karo</h2>
            <p className="text-text-muted text-sm mb-6">Linking for: {selectedMenuitem.name}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-1">Select Ingredient</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none"
                  value={selectedInventoryItem}
                  onChange={e => setSelectedInventoryItem(e.target.value)}
                >
                  <option value="">Select Item...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-1">Quantity Used per order</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={quantityUsed} 
                    onChange={e => setQuantityUsed(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs">
                    {items.find(i => i.id === selectedInventoryItem)?.unit || '-'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm font-bold">Auto Deduct</p>
                  <p className="text-[10px] text-text-muted">Stock update automatically on order completion</p>
                </div>
                <button 
                  onClick={() => setIsAutoDeduct(!isAutoDeduct)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isAutoDeduct ? 'bg-saffron' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAutoDeduct ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 saffron-btn" onClick={handleAddLink}>Save Link</button>
                <button className="px-6 py-3 rounded-xl bg-white/5 text-text-muted font-bold" onClick={() => setIsLinkModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="modal-content w-full max-w-md">
            <h2 className="text-2xl font-fraunces mb-6">Add Supplier</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-2">Supplier Name</label>
                <input 
                  type="text" 
                  value={supplierName} 
                  onChange={e => setSupplierName(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none"
                  placeholder="e.g. Bharat Dairy"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-2">Phone Number</label>
                <input 
                  type="text" 
                  value={supplierPhone} 
                  onChange={e => setSupplierPhone(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-2">Items they supply</label>
                <input 
                  type="text" 
                  value={supplierItems} 
                  onChange={e => setSupplierItems(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none"
                  placeholder="e.g. Milk, Paneer, Curd"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-black text-text-muted tracking-widest block mb-2">Notes</label>
                <textarea 
                  value={supplierNotes} 
                  onChange={e => setSupplierNotes(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text-main outline-none min-h-[100px]"
                  placeholder="e.g. Delivers every Monday"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 saffron-btn" onClick={handleAddSupplier}>Save Supplier</button>
                <button className="px-6 py-3 rounded-xl bg-white/5 text-text-muted font-bold" onClick={() => setIsSupplierModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
