import React, { useEffect, useState } from "react";
import {
  LayoutGrid,
  Building2,
  Layers,
  Plus,
  X,
  Maximize2,
  Bed,
  Bath,
  IndianRupee,
  Edit,
  Trash2,
  ChevronRight,
  ArrowUpRight,
  Monitor,
  CheckCircle2,
  HelpCircle,
  Hash,
  Scale
} from "lucide-react";
import { useAuth } from "../store/auth";
import { useToast } from "../store/ToastContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const initialFloorData = {
  propertyId: "",
  name: "",
  floorNumber: "",
  description: ""
};

const initialUnitData = {
  propertyId: "",
  floorId: "",
  unitNumber: "",
  unitType: "Flat",
  area: "",
  bedrooms: "",
  bathrooms: "",
  balcony: false,
  rentAmount: "",
  securityDeposit: "",
  utilityIncluded: false
};

const FloorUnit = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("floors"); // "floors" or "units"

  // Data states
  const [properties, setProperties] = useState([]);
  const [floors, setFloors] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [openFloorForm, setOpenFloorForm] = useState(false);
  const [openUnitForm, setOpenUnitForm] = useState(false);
  const [editFloorId, setEditFloorId] = useState(null);
  const [editUnitId, setEditUnitId] = useState(null);

  const [floorData, setFloorData] = useState(initialFloorData);

  const [unitData, setUnitData] = useState(initialUnitData);

  const [selectedPropertyForUnit, setSelectedPropertyForUnit] = useState("");
  const isEditingFloor = Boolean(editFloorId);
  const isEditingUnit = Boolean(editUnitId);

  // Fetch initial data
  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:7000/api/owner/properties", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setProperties(data.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchFloors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:7000/api/owner/floors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setFloors(data.floors || []);
    } catch (error) {
      console.error("Error fetching floors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:7000/api/owner/units", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setUnits(data.units || []);
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchFloors();
    fetchUnits();
  }, []);

  // Handlers
  const getNextUnitNumber = (lastUnitNumber) => {
    if (!lastUnitNumber) return "";
    const match = lastUnitNumber.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const number = parseInt(match[2], 10);
      const nextNumber = number + 1;
      const paddedNumber = nextNumber.toString().padStart(match[2].length, '0');
      return prefix + paddedNumber;
    }
    return lastUnitNumber;
  };

  const handleFloorChange = (e) => {
    const { name, value } = e.target;
    setFloorData(prev => {
      const newData = { ...prev, [name]: value };

      // Auto-suggest floor number when property is selected
      if (name === "propertyId" && value && !isEditingFloor) {
        const propertyFloors = floors.filter(f => (f.propertyId?._id || f.propertyId) === value);
        if (propertyFloors.length > 0) {
          const numbers = propertyFloors.map(f => parseInt(f.floorNumber)).filter(n => !isNaN(n));
          const max = Math.max(...numbers);
          newData.floorNumber = max + 1;
          newData.name = `Floor ${max + 1}`;
        } else {
          newData.floorNumber = 0;
          newData.name = "Ground Floor";
        }
      }
      return newData;
    });
  };

  const handleUnitChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUnitData(prev => {
      const newData = { ...prev, [name]: type === "checkbox" ? checked : value };

      if (name === "propertyId") {
        setSelectedPropertyForUnit(value);
        newData.floorId = ""; // Reset floor when property changes
      }

      // Auto-suggest unit number when floor is selected
      if (name === "floorId" && value && !isEditingUnit) {
        const floorUnits = units.filter(u => (u.floorId?._id || u.floorId) === value);
        if (floorUnits.length > 0) {
          // Sort units to find the last one
          const lastUnit = floorUnits[floorUnits.length - 1];
          newData.unitNumber = getNextUnitNumber(lastUnit.unitNumber);
        } else {
          // Default suggesting based on floor number
          const selectedFloor = floors.find(f => f._id === value);
          if (selectedFloor) {
            newData.unitNumber = `${selectedFloor.floorNumber}01`;
          }
        }
      }
      return newData;
    });
  };
  const handleFloorSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        isEditingFloor
          ? `http://localhost:7000/api/owner/floor/${editFloorId}`
          : "http://localhost:7000/api/owner/floor",
        {
          method: isEditingFloor ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(floorData)
        });
      const data = await response.json();
      if (response.ok) {
        toast.success(isEditingFloor ? "Floor updated successfully" : "Floor created successfully");
        if (isEditingFloor) {
          setOpenFloorForm(false);
          setEditFloorId(null);
          setFloorData(initialFloorData);
        } else {
          // Keep propertyId but increment floorNumber
          const nextFloorNumber = parseInt(floorData.floorNumber) + 1;
          setFloorData({
            ...initialFloorData,
            propertyId: floorData.propertyId,
            floorNumber: nextFloorNumber,
            name: `Floor ${nextFloorNumber}`
          });
        }
        fetchFloors();
      } else {
        toast.error(data.msg || "Failed to save floor");
      }
    } catch (error) {
      toast.error("Error saving floor");
    }
  };

  const resetUnitForm = () => {
    setEditUnitId(null);
    setUnitData(initialUnitData);
    setSelectedPropertyForUnit("");
  };



  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        isEditingUnit
          ? `http://localhost:7000/api/owner/unit/${editUnitId}`
          : "http://localhost:7000/api/owner/unit",
        {
          method: isEditingUnit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(unitData)
        });
      const data = await response.json();
      if (response.ok) {
        toast.success(isEditingUnit ? "Unit updated successfully" : "Unit created successfully");
        if (isEditingUnit) {
          setOpenUnitForm(false);
          resetUnitForm();
        } else {
          // Keep property/floor but increment unitNumber
          const nextUnitNumber = getNextUnitNumber(unitData.unitNumber);
          setUnitData({
            ...initialUnitData,
            propertyId: unitData.propertyId,
            floorId: unitData.floorId,
            unitNumber: nextUnitNumber,
          });
        }
        fetchUnits();
      } else {
        toast.error(data.message || "Failed to save unit");
      }
    } catch (error) {
      toast.error("Error saving unit");
    }
  };

  const handleDeleteFloor = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:7000/api/owner/floor/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success("Floor Deleted Successfully")
        setFloors(prev => prev.filter(p => p._id !== id));
      } else {
        const data = await response.json();
        toast.error(data.msg || data.message || "Failed to delete");
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  const handleEditFloor = (floor) => {
    setFloorData({
      propertyId: floor.propertyId?._id || floor.propertyId || "",
      name: floor.name || "",
      floorNumber: floor.floorNumber ?? "",
      description: floor.description || ""
    });
    setEditFloorId(floor._id);
    setOpenFloorForm(true);
  };

  const handleEditUnit = (unit) => {
    const propertyId = unit.propertyId?._id || unit.propertyId || "";
    setUnitData({
      propertyId,
      floorId: unit.floorId?._id || unit.floorId || "",
      unitNumber: unit.unitNumber || "",
      unitType: unit.unitType || "Flat",
      area: unit.area ?? "",
      bedrooms: unit.bedrooms ?? "",
      bathrooms: unit.bathrooms ?? "",
      balcony: Boolean(unit.balcony),
      rentAmount: unit.rentAmount ?? "",
      securityDeposit: unit.securityDeposit ?? "",
      utilityIncluded: Boolean(unit.utilityIncluded)
    });
    setSelectedPropertyForUnit(propertyId);
    setEditUnitId(unit._id);
    setOpenUnitForm(true);
  };

  const handleDeleteUnit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:7000/api/owner/unit/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Unit deleted successfully");
        setUnits(prev => prev.filter(u => u._id !== id));
      } else {
        toast.error(data.message || "Failed to delete unit");
      }
    } catch (error) {
      toast.error("Error deleting unit");
    }
  };


  const filteredFloorsForUnit = floors.filter(f => (f.propertyId?._id || f.propertyId) === selectedPropertyForUnit);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

      {/* Header Area */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--color-secondary)] tracking-tight">Floor & Unit Management</h1>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <Button
            onClick={() => setActiveTab("floors")}
            variant={activeTab === "floors" ? "primary" : "ghost"}
            size="sm"
            className={activeTab === "floors" ? "scale-105" : ""}
          >
            Floor
          </Button>
          <Button
            onClick={() => setActiveTab("units")}
            variant={activeTab === "units" ? "primary" : "ghost"}
            size="sm"
            className={activeTab === "units" ? "scale-105" : ""}
          >
            Unit
          </Button>
        </div>
      </header>

      {/* Stats Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Layers, label: "Structural Levels", val: floors.length, color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: LayoutGrid, label: "Live Units", val: units.length, color: "text-purple-600", bg: "bg-purple-50" },
          { icon: IndianRupee, label: "Projected Rev", val: `₹${units.reduce((acc, u) => acc + (u.rentAmount || 0), 0).toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
              <stat.icon size={26} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">{stat.label}</p>
              <p className="text-2xl font-black text-[var(--color-secondary)] tracking-tight">{stat.val}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Control Area */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
          <Monitor size={16} className="text-gray-400" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Current Scope: <span className="text-[var(--color-secondary)]">{activeTab === "floors" ? "Vertical Mapping" : "Horizontal Inventory"}</span></span>
        </div>
        <Button
          onClick={() => {
            if (activeTab === "floors") {
              setEditFloorId(null);
              setFloorData(initialFloorData);
              setOpenFloorForm(true);
            } else {
              resetUnitForm();
              setOpenUnitForm(true);
            }
          }}
          variant="primary"
          icon={<Plus size={18} />}
          size="md"
        >
          Create {activeTab === "floors" ? "New Floor" : "New Unit"}
        </Button>
      </section>

      {/* Main Table Content */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] min-h-[500px] relative">
        <div className="overflow-x-auto">
          {activeTab === "floors" ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Floor</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Property</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Floor Number</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Units</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {floors.length > 0 ? floors.map(floor => (
                  <tr key={floor._id} className="hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-[var(--color-primary)]">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <Layers size={18} />
                        </div>
                        <span className="text-sm font-black text-[var(--color-secondary)] uppercase tracking-tight">{floor.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--color-secondary)]">
                        <Building2 size={13} className="text-rose-500" />
                        {floor.propertyId?.propertyName || "Unlinked Asset"}
                      </div>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <span className="inline-flex px-4 py-1.5 bg-gray-50 text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-[0.1em] rounded-full border border-gray-100">
                        Floor: {floor.floorNumber}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-indigo-600">{units.filter(u => u.floorId?._id === floor._id).length}</span>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Active Units</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleEditFloor(floor)}
                          variant="secondary"
                          size="xs"
                          iconOnly
                          icon={<Edit size={16} />}
                        />
                        <Button
                          onClick={() => handleDeleteFloor(floor._id)}
                          variant="danger"
                          size="xs"
                          iconOnly
                          icon={<Trash2 size={16} />}
                        />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Layers size={60} className="text-gray-300" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">No floor levels established</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Unit Specification</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Physical Location</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Type & Area</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Occupancy</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Rent Yield</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {units.length > 0 ? units.map(unit => (
                  <tr key={unit._id} className="hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-600">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-xs font-black shadow-xl shadow-gray-200 group-hover:-rotate-6 transition-transform">
                          {unit.unitNumber}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[12px] font-black text-[var(--color-secondary)] uppercase">Ref ID: {unit._id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter opacity-40">Established Unit</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[12px] font-black text-[var(--color-secondary)]">
                          <Building2 size={13} className="text-indigo-400" />
                          {unit.propertyId?.propertyName}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)]">
                          <Layers size={10} className="text-gray-300" />
                          Level {unit.floorId?.floorNumber || "?"}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="space-y-1.5">
                        <span className="inline-flex px-3 py-1 bg-gray-50 text-[9px] font-black text-[var(--color-secondary)] uppercase tracking-widest rounded-lg border border-gray-100">
                          {unit.unitType}
                        </span>
                        <p className="flex items-center gap-1.5 text-[11px] font-black text-[var(--text-muted)] opacity-60 ml-1">
                          <Maximize2 size={11} /> {unit.area} Sq.Ft
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${unit.status === 'Vacant' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        unit.status === 'Occupied' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${unit.status === 'Vacant' ? 'bg-emerald-500' : unit.status === 'Occupied' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-emerald-600 tracking-tight">₹{unit.rentAmount?.toLocaleString()}</span>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 mt-1">Monthly Cycle</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleEditUnit(unit)}
                          variant="secondary"
                          size="xs"
                          iconOnly
                          icon={<Edit size={16} />}
                        />
                        <Button
                          onClick={() => handleDeleteUnit(unit._id)}
                          variant="danger"
                          size="xs"
                          iconOnly
                          icon={<Trash2 size={16} />}
                        />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <LayoutGrid size={60} className="text-gray-300" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">No individual units deployed</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Floor Modal */}
      {openFloorForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300 font-['Inter']">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={() => { setOpenFloorForm(false); setEditFloorId(null); setFloorData(initialFloorData); }}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-[0_40px_100px_-20_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col">

            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white z-10">
              <div>
                <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight">{isEditingFloor ? "Edit Floor" : "Create Floor"}</h2>
              </div>
              <Button onClick={() => { setOpenFloorForm(false); setEditFloorId(null); setFloorData(initialFloorData); }} variant="secondary" size="sm" iconOnly icon={<X size={20} />} />
            </div>

            <form className="p-6 space-y-4" onSubmit={handleFloorSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[var(--text-secondary)] text-sm font-semibold">Select Property</label>
                  <div className="relative">
                    <select
                      name="propertyId"
                      value={floorData.propertyId}
                      onChange={handleFloorChange}
                      required
                      disabled={isEditingFloor}
                      className="w-full px-4 py-3 border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl outline-none transition appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">-- Choose Host Asset --</option>
                      {properties.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none opacity-40 rotate-90" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Floor Name"
                    name="name"
                    value={floorData.name}
                    onChange={handleFloorChange}
                    required
                    variant="formInput"
                    placeholder="e.g. Executive Level"
                  />
                  <Input
                    label="Floor Number"
                    name="floorNumber"
                    type="number"
                    value={floorData.floorNumber}
                    onChange={handleFloorChange}
                    required
                    variant="formInput"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[var(--text-secondary)] text-sm font-semibold">Description</label>
                  <textarea name="description" value={floorData.description} onChange={handleFloorChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl px-6 py-4 text-xs font-medium text-[var(--color-secondary)] shadow-sm focus:outline-none min-h-[100px] resize-none transition-all" placeholder="Structural highlights or floor-specific constraints..." />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 mt-4 border-t border-gray-50 bg-white">
                <Button type="button" htmlType="submit" variant="ghost" size="sm" onClick={() => { setOpenFloorForm(false); setEditFloorId(null); setFloorData(initialFloorData); }}>Cancel</Button>
                <Button type="submit" htmlType="submit" variant="primary" size="md">
                  {isEditingFloor ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Modal */}
      {openUnitForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={() => { setOpenUnitForm(false); resetUnitForm(); }}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_40px_100px_-20_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col">

            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white z-10">
              <div>
                <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight">{isEditingUnit ? "Edit Unit" : "Create Unit"}</h2>
              </div>
              <Button onClick={() => { setOpenUnitForm(false); resetUnitForm(); }} variant="secondary" size="sm" iconOnly icon={<X size={20} />} />
            </div>

            <form className="p-6 space-y-4" onSubmit={handleUnitSubmit}>
              <div className="grid md:grid-cols-2 gap-8">

                {/* Identification & Layout */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-[var(--color-secondary)] uppercase tracking-[0.1em]">Unit Details</h3>
                  </div>

                  <div className="space-y-4 bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100">
                    <div className="space-y-2">
                      <label className="block text-[var(--text-secondary)] text-sm font-semibold">Property</label>
                      <div className="relative">
                        <select name="propertyId" value={unitData.propertyId} onChange={handleUnitChange} required className="w-full px-4 py-3 border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl outline-none transition appearance-none cursor-pointer">
                          <option value="">-- Choose Asset --</option>
                          {properties.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                        </select>
                        <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 rotate-90" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[var(--text-secondary)] text-sm font-semibold">Floor</label>
                      <div className="relative">
                        <select name="floorId" value={unitData.floorId} onChange={handleUnitChange} required disabled={!selectedPropertyForUnit} className="w-full px-4 py-3 border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl outline-none transition appearance-none cursor-pointer disabled:opacity-50">
                          <option value="">-- Choose Floor --</option>
                          {filteredFloorsForUnit.map(f => <option key={f._id} value={f._id}>{f.name} (Lvl {f.floorNumber})</option>)}
                        </select>
                        <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 rotate-90" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Unit Prefix"
                        name="unitNumber"
                        value={unitData.unitNumber}
                        onChange={handleUnitChange}
                        required
                        variant="formInput"
                        placeholder="A-101"
                      />
                      <div className="space-y-2">
                        <label className="block text-[var(--text-secondary)] text-sm font-semibold">Type</label>
                        <select name="unitType" value={unitData.unitType} onChange={handleUnitChange} className="w-full px-4 py-3 border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl outline-none transition appearance-none cursor-pointer">
                          {["Flat", "Shop", "Office", "Warehouse", "Parking"].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale size={14} className="text-gray-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Configuration Metrics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Bedrooms"
                        name="bedrooms"
                        variant="formInput"
                        value={unitData.bedrooms}
                        onChange={handleUnitChange}
                      />
                      <Input
                        type="number"
                        label="Bathrooms"
                        name="bathrooms"
                        variant="formInput"
                        value={unitData.bathrooms}
                        onChange={handleUnitChange}
                      />
                    </div>
                    <Input
                      label="Area (Sq.Ft)"
                      type="number"
                      name="area"
                      value={unitData.area}
                      onChange={handleUnitChange}
                      required
                      variant="formInput"
                      placeholder="e.g. 1200"
                    />
                  </div>
                </section>

                {/* Finance & Features */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-[var(--color-secondary)] uppercase tracking-[0.1em]">Financials</h3>
                  </div>

                  <div className="p-5 bg-emerald-50/30 rounded-[2rem] border border-emerald-100 space-y-5">
                    <Input
                      label="Rent Amount (Monthly)"
                      type="number"
                      name="rentAmount"
                      value={unitData.rentAmount}
                      onChange={handleUnitChange}
                      required
                      variant="formInput"
                      placeholder="25000"
                    />
                    <Input
                      label="Security Deposit"
                      type="number"
                      name="securityDeposit"
                      value={unitData.securityDeposit}
                      onChange={handleUnitChange}
                      variant="formInput"
                      placeholder="e.g. 50000"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Maximize2 size={14} className="text-gray-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Unit Infrastructure</span>
                    </div>
                    <label className="flex items-center gap-4 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group shadow-sm">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${unitData.balcony ? 'bg-indigo-600 text-white' : 'bg-white text-gray-300 border border-gray-100'}`}>
                        {unitData.balcony ? <CheckCircle2 size={18} /> : <HelpCircle size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-[var(--color-secondary)] uppercase tracking-tight">Private Vertical Space</p>
                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase opacity-40">Balcony access verified</p>
                      </div>
                      <input type="checkbox" name="balcony" checked={unitData.balcony} onChange={handleUnitChange} className="hidden" />
                    </label>

                    <label className="flex items-center gap-4 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group shadow-sm">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${unitData.utilityIncluded ? 'bg-indigo-600 text-white' : 'bg-white text-gray-300 border border-gray-100'}`}>
                        {unitData.utilityIncluded ? <CheckCircle2 size={18} /> : <HelpCircle size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-[var(--color-secondary)] uppercase tracking-tight">Utility Infrastructure</p>
                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase opacity-40">Integrated in yield cycle</p>
                      </div>
                      <input type="checkbox" name="utilityIncluded" checked={unitData.utilityIncluded} onChange={handleUnitChange} className="hidden" />
                    </label>
                  </div>
                </section>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 mt-6 border-t border-gray-50 bg-white">
                <Button type="button" htmlType="submit" variant="ghost" size="sm" onClick={() => { setOpenUnitForm(false); resetUnitForm(); }}>Cancel</Button>
                <Button type="submit" htmlType="submit" variant="primary" size="md">
                  {isEditingUnit ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorUnit;
