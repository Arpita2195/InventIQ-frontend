import { useState, useRef, useMemo } from "react";
import { inventoryApi } from "../api";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  PackagePlus,
  ArrowDownUp,
  Filter
} from "lucide-react";
import { Input, Select, ShimmerButton, Badge, cn } from "./ui";

const CATEGORY_MAP = {
  "General": ["Other"],
  "Fresh Vegetables": ["Potato", "Onion", "Tomato", "Green Chilli", "Other"],
  "Fresh Fruits": ["Apple", "Banana", "Mango", "Other"],
  "Milk": ["Amul", "Mother Dairy", "Gokul", "Nandini", "Other"],
  "Curd": ["Amul", "Mother Dairy", "Gowardhan", "Other"],
  "Bread": ["Britannia", "Modern", "Harvest Gold", "Other"],
  "Rice/Atta/Grains (Packed)": ["Aashirvaad", "India Gate", "Daawat", "Fortune", "Pillsbury", "Other"],
  "Pulses/Dal (Packed)": ["Tata Sampann", "Rajdhani", "Other"],
  "Sugar": ["Madhur", "Trust", "Parry's", "Other"],
  "Tea": ["Taj Mahal", "Red Label", "Tata Tea", "Wagh Bakri", "Other"],
  "Coffee": ["Nescafe", "Bru", "Davidoff", "Other"],
  "Edible Oil": ["Fortune", "Saffola", "Gemini", "Dhara", "Other"],
  "Spices": ["Everest", "MDH", "Catch", "Suhana", "Other"],
  "Masala": ["Everest", "MDH", "Catch", "Suhana", "Other"],
  "Hair Oil": ["Parachute", "Dabur Amla", "Bajaj Almond drops", "Other"],
  "Soap": ["Dove", "Pears", "Lifebuoy", "Lux", "Santoor", "Other"],
  "Toothpaste": ["Colgate", "Pepsodent", "Close-Up", "Patanjali Dant Kanti", "Sensodyne", "Other"],
  "Shampoo": ["Sunsilk", "Clinic Plus", "Head & Shoulders", "L'Oreal", "Other"],
  "Detergent": ["Surf Excel", "Tide", "Ariel", "Rin", "Wheel", "Other"],
  "Biscuits": ["Parle-G", "Britannia Good Day", "Sunfeast", "Oreo", "Other"],
  "Chocolates": ["Dairy Milk", "KitKat", "Munch", "5 Star", "Other"],
  "Aerated Drinks": ["Coca-Cola", "Pepsi", "Sprite", "Thums Up", "Other"],
  "Snacks": ["Lays", "Kurkure", "Maggie", "Bingo", "Other"],
  "Fruit Juice": ["Real", "Tropicana", "Paper Boat", "Other"],
  "Mineral Water": ["Kinley", "Aquafina", "Bisleri", "Other"]
};

const GST_CATEGORIES = Object.keys(CATEGORY_MAP);

const autoClassifyLocal = (name) => {
  const n = name.toLowerCase();
  if (n.includes("rice") || n.includes("atta") || n.includes("wheat")) return { category: "Rice/Atta/Grains (Packed)", subcategory: "Other" };
  if (n.includes("dal") || n.includes("chan")) return { category: "Pulses/Dal (Packed)", subcategory: "Other" };
  if (n.includes("maggie") || n.includes("maggi") || n.includes("noodles")) return { category: "Snacks", subcategory: "Maggie" };
  if (n.includes("juice") || n.includes("real")) return { category: "Fruit Juice", subcategory: "Other" };
  if (n.includes("chocolate") || n.includes("dairy milk") || n.includes("silk") || n.includes("kitkat")) return { category: "Chocolates", subcategory: "Other" };
  if (n.includes("biscuits") || n.includes("parle") || n.includes("good day")) return { category: "Biscuits", subcategory: "Other" };
  if (n.includes("water") || n.includes("bottel") || n.includes("kinley") || n.includes("bisleri")) return { category: "Mineral Water", subcategory: "Other" };
  if (n.includes("colgate")) return { category: "Toothpaste", subcategory: "Colgate" };
  return null;
};

export default function InventoryTable({ items = [], onRefresh, getGSTRate }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const debounceTimerRef = useRef(null);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "General",
    subcategory: "Other",
    quantity: 0,
    unit: "pcs",
    price: 0,
    mrp: 0,
    expiryDate: "",
    lowStockThreshold: 5,
  });

  const runAiClassify = async (name, stateSetter) => {
    if (name.length < 3) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const { data } = await inventoryApi.classify(name);
        if (data && data.category) {
          stateSetter(prev => ({
            ...prev,
            category: data.category,
            subcategory: data.subcategory || "Other",
            unit: data.unit || prev.unit
          }));
        }
      } catch (err) {
        console.error("AI Classify Fail:", err);
      } finally {
        setAnalyzing(false);
      }
    }, 800);
  };

  const addItem = async () => {
    if (!newItem.name) return;
    try {
      await inventoryApi.add(newItem);
      setNewItem({ name: "", category: "General", subcategory: "Other", quantity: 0, unit: "pcs", price: 0, mrp: 0, expiryDate: "", lowStockThreshold: 5 });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm("Delete this item from inventory?")) {
      await inventoryApi.remove(id);
      onRefresh();
    }
  };

  const startEdit = (item) => {
    setEditing(item._id);
    setEditVal({ ...item });
  };

  const saveEdit = async (id) => {
    try {
      await inventoryApi.update(id, editVal);
      setEditing(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => {
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category?.toLowerCase().includes(search.toLowerCase()) ||
        i.subcategory?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  return (
    <div className="flex flex-col h-full bg-white animate-fadeIn">
      {/* Search and Header Section */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={18} />
          </div>
          <Input
            placeholder="Search items, brands, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 py-2.5 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="px-3 py-1 font-bold">
            {filtered.length} Items Found
          </Badge>
          <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Product Information</th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Category / Brand</th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Inventory Level</th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Purchase Price</th>
              <th className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Expiration Audit</th>
              <th className="px-6 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tax</th>
              <th className="px-6 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Operations</th>
            </tr>
          </thead>
          <tbody>
            {/* Add New Item Row */}
            <tr className="border-b-2 border-indigo-50 bg-indigo-50/20 group hover:bg-indigo-50/40 transition-all">
              <td className="px-6 py-6 min-w-[240px]">
                <div className="relative">
                  <Input
                    placeholder="New product name..."
                    value={newItem.name}
                    onChange={(e) => {
                      const n = e.target.value;
                      const c = autoClassifyLocal(n);
                      const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
                      const defExp = exp.toISOString().split('T')[0];
                      if (c) setNewItem({ ...newItem, name: n, expiryDate: defExp, mrp: newItem.mrp || (newItem.price * 1.2), ...c });
                      else { setNewItem({ ...newItem, name: n, expiryDate: defExp }); runAiClassify(n, setNewItem); }
                    }}
                    className="bg-white border-indigo-100 focus:border-indigo-400 text-sm h-11"
                  />
                  {analyzing && (
                    <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white border border-indigo-100 rounded-lg shadow-sm animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">AI Processing</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-6 min-w-[200px]">
                <div className="flex flex-col gap-2">
                  <Select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value, subcategory: "Other" })}
                    className="h-10 text-[12px] bg-white border-indigo-100"
                  >
                    {GST_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </Select>
                  <Select
                    value={newItem.subcategory}
                    onChange={(e) => setNewItem({ ...newItem, subcategory: e.target.value })}
                    className="h-9 text-[11px] bg-white border-indigo-100"
                  >
                    {(CATEGORY_MAP[newItem.category] || ["Other"]).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </Select>
                </div>
              </td>
              <td className="px-6 py-6 font-bold">
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={newItem.quantity} 
                    onChange={(e) => setNewItem({ ...newItem, quantity: +e.target.value })} 
                    className="w-20 bg-white border-indigo-100 h-11 text-center"
                  />
                  <span className="text-slate-400 text-[10px] uppercase font-black">UNIT</span>
                </div>
              </td>
              <td className="px-6 py-6 font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-black text-sm">₹</span>
                  <Input 
                    type="number" 
                    value={newItem.price} 
                    onChange={(e) => setNewItem({ ...newItem, price: +e.target.value })} 
                    className="w-24 bg-white border-indigo-100 h-11"
                  />
                </div>
              </td>
              <td className="px-6 py-6">
                <Input 
                  type="date" 
                  value={newItem.expiryDate} 
                  onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} 
                  className="w-36 bg-white border-indigo-100 h-11 text-[12px]"
                />
              </td>
              <td className="px-6 py-6 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-100 bg-white flex items-center justify-center mx-auto">
                   <HelpCircle size={16} className="text-indigo-300" />
                </div>
              </td>
              <td className="px-6 py-6 text-right">
                <ShimmerButton 
                  onClick={addItem} 
                  disabled={!newItem.name}
                  className="px-6 py-2.5 rounded-xl text-[13px] whitespace-nowrap"
                >
                  <PackagePlus size={16} className="mr-2 inline" />
                  Register
                </ShimmerButton>
              </td>
            </tr>

            {/* Existing Items Rows */}
            {filtered.map((item) => {
              const isEdit = editing === item._id;
              const isLow = item.quantity <= item.lowStockThreshold;
              const gstRate = getGSTRate(item.category, item.name);
              const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
              const isExpiringSoon = expiryDate && expiryDate < new Date(Date.now() + 30*24*60*60*1000);

              return (
                <tr key={item._id} className={cn(
                  "border-b border-slate-50 hover:bg-slate-50/50 transition-all group",
                  isEdit && "bg-slate-50/80 shadow-inner"
                )}>
                  <td className="px-6 py-5">
                    {isEdit ? (
                      <Input 
                        value={editVal.name} 
                        onChange={(e) => setEditVal({ ...editVal, name: e.target.value })} 
                        className="bg-white"
                      />
                    ) : (
                      <div>
                        <div className="text-[14.5px] font-black text-slate-800">{item.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-tighter uppercase">ID: {item._id.slice(-6)}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {isEdit ? (
                      <div className="flex flex-col gap-2">
                        <Select 
                          value={editVal.category} 
                          onChange={(e) => setEditVal({ ...editVal, category: e.target.value, subcategory: "Other" })}
                          className="text-[12px] h-9"
                        >
                          {GST_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </Select>
                        <Select 
                          value={editVal.subcategory} 
                          onChange={(e) => setEditVal({ ...editVal, subcategory: e.target.value })}
                          className="text-[11px] h-8"
                        >
                          {(CATEGORY_MAP[editVal.category] || ["Other"]).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </Select>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 items-start">
                         <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md text-[10.5px] font-black uppercase tracking-tight">
                           {item.category}
                         </div>
                         <div className="flex items-center gap-1.5 ml-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <span className="text-[11px] text-slate-400 font-bold">{item.subcategory || "Other"}</span>
                         </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {isEdit ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          value={editVal.quantity} 
                          onChange={(e) => setEditVal({ ...editVal, quantity: +e.target.value })} 
                          className="w-20 bg-white"
                        />
                        <span className="text-slate-400 text-[10px] font-black uppercase">Qty</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "px-4 py-1.5 rounded-full font-black text-[13px] flex items-center gap-2",
                          isLow ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        )}>
                          {isLow && <AlertCircle size={14} />}
                          {!isLow && <CheckCircle2 size={14} />}
                          {item.quantity}
                        </div>
                        {isLow && <span className="text-[9px] text-rose-400 font-black uppercase tracking-widest leading-none">Restock Required</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {isEdit ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold text-sm">₹</span>
                        <Input 
                          type="number" 
                          value={editVal.price} 
                          onChange={(e) => setEditVal({ ...editVal, price: +e.target.value })} 
                          className="w-28 bg-white"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                         <span className="text-slate-300 font-black text-sm">₹</span>
                         <span className="text-[16px] font-black text-slate-700 tracking-tight">{item.price.toLocaleString()}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                     {isEdit ? (
                       <Input 
                        type="date" 
                        value={editVal.expiryDate?.split('T')[0]} 
                        onChange={(e) => setEditVal({ ...editVal, expiryDate: e.target.value })} 
                        className="w-36 bg-white text-[12px]" 
                       />
                     ) : (
                       <div className="flex flex-col">
                          <span className={cn(
                            "text-[13px] font-bold tracking-tight",
                            isExpiringSoon ? 'text-rose-500' : 'text-slate-600'
                          )}>
                            {item.expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (
                              <span className="text-slate-300 font-normal italic">No Date</span>
                            )}
                          </span>
                          {isExpiringSoon && (
                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider mt-0.5">Expires in ~30 days</span>
                          )}
                       </div>
                     )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className={cn(
                      "inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] font-black border",
                      gstRate >= 18 ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                      gstRate > 0 ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      {gstRate}%
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {isEdit ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => saveEdit(item._id)} 
                          className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                          title="Save Changes"
                        >
                          <Save size={18} />
                        </button>
                        <button 
                          onClick={() => setEditing(null)} 
                          className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all font-bold text-xs"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
                        <button 
                          onClick={() => startEdit(item)} 
                          className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteItem(item._id)} 
                          className="p-2.5 bg-white border border-slate-100 text-rose-300 rounded-xl hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/50 transition-all shadow-sm"
                          title="Remove Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-24 text-center">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search size={24} className="text-slate-300" />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">No Matching Products Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
