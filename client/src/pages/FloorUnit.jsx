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
  DollarSign,
  Edit,
  Trash2
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



  const filteredFloorsForUnit = floors.filter(f => f.propertyId?._id === selectedPropertyForUnit);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-secondary)] tracking-tight">Floor & Unit Management</h1>
        </div>
        <div className="flex gap-2 p-1 bg-[var(--color-card)]/50 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("floors")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "floors" ? "bg-[var(--color-primary)] text-white shadow-lg" : "text-[var(--text-card)] hover:text-[var(--text-secondary)]"}`}
          >
            Floors
          </button>
          <button
            onClick={() => setActiveTab("units")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "units" ? "bg-[var(--color-primary)] text-white shadow-lg" : "text-[var(--text-card)] hover:text-[var(--text-secondary)]"}`}
          >
            Units
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--color-card)] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
              <Layers size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--text-secondary)]">{floors.length}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-card)]">Total Floors</div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--color-card)] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500">
              <LayoutGrid size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--text-secondary)]">{units.length}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-card)]">Total Units</div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--color-card)] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-green-500/10 rounded-2xl text-green-500">
              <DollarSign size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--text-secondary)]">${units.reduce((acc, u) => acc + (u.rentAmount || 0), 0).toLocaleString()}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-card)]">Total Rent Pipeline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--color-card)] shadow-2xl overflow-hidden min-h-[500px] relative">
        {/* Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-primary)] to-[var(--color-primary)]/20"></div>

        <div className="p-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-black text-[var(--text-secondary)] flex items-center gap-3">
            {activeTab === "floors" ? <Layers className="text-[var(--color-primary)]" /> : <LayoutGrid className="text-[var(--color-primary)]" />}
            {activeTab === "floors" ? "Floor Inventory" : "Unit Directory"}
            <span className="ml-2 px-3 py-1 bg-[var(--color-card)] rounded-full text-xs font-bold text-[var(--text-card)] uppercase tracking-widest leading-none">
              {activeTab === "floors" ? floors.length : units.length} Recorded
            </span>
          </h2>
          <Button
            onClick={() => {
              if (activeTab === "floors") {
                setEditFloorId(null);
                setFloorData(initialFloorData);
                setOpenFloorForm(true);
                return;
              }
              resetUnitForm();
              setOpenUnitForm(true);
            }}
            className="rounded-2xl px-8 h-12 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--color-primary)]/20"
          >
            <Plus size={18} className="mr-2" />
            Create {activeTab === "floors" ? "Floor" : "Unit"}
          </Button>
        </div>

        <div className="overflow-x-auto p-2">
          {loading ? (
            <div className="p-20 text-center animate-pulse text-[var(--text-card)] font-bold tracking-widest uppercase">Initializing Structure...</div>
          ) : activeTab === "floors" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-card)]">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)]">Floor Name</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)]">Property</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)] text-center">Floor Level</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)]">Description</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)] text-center">Units</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-card)]/50">
                {floors.length > 0 ? floors.map(floor => (
                  <tr key={floor._id} className="group hover:bg-[var(--color-card)]/20 transition-all">
                    <td className="p-6">
                      <div className="font-bold text-[var(--text-secondary)]">{floor.name}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-card)]">
                        <Building2 size={14} />
                        {floor.propertyId?.propertyName || "N/A"}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-xs font-black border border-blue-500/20">
                        Level {floor.floorNumber}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="text-sm text-[var(--text-card)] max-w-xs truncate">{floor.description || "—"}</div>
                    </td>
                    <td className="p-6 text-center text-sm font-bold text-[var(--text-secondary)]">
                      {units.filter(u => u.floorId?._id === floor._id).length}
                    </td>
                    <td className="p-6 text-center text-sm font-bold text-[var(--text-secondary)]">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEditFloor(floor)} className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteFloor(floor._id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Layers size={64} className="mb-4" />
                        <div className="text-xl font-black">No Floors Established</div>
                        <p className="text-sm">Establish floors to begin unit organization</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-card)]">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)]">Unit</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)]">Property Name</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)]">Type</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)]">Rent</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)] text-center">Status</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-card)] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-card)]/50">
                {units.length > 0 ? units.map(unit => (
                  <tr key={unit._id} className="group hover:bg-[var(--color-card)]/20 transition-all">
                    <td className="p-6">
                      <div className="font-black text-[var(--text-secondary)] text-lg">{unit.unitNumber}</div>

                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-[var(--text-secondary)]">{unit.propertyId?.propertyName}</div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-slate-500/10 text-[var(--text-card)] rounded-lg text-[10px] font-black tracking-widest uppercase border border-white/5">
                        {unit.unitType}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="text-lg font-black text-green-500">${unit.rentAmount}</div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${unit.status === 'Vacant' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        unit.status === 'Occupied' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-orange-500/10 text-orange-500 border-orange-500/20'
                        }`}>
                        {unit.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEditUnit(unit)} className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteUnit(unit._id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <LayoutGrid size={64} className="mb-4" />
                        <div className="text-xl font-black">No Units Deployed</div>
                        <p className="text-sm">Establish properties and floors first, then add units</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Floor Modal */}
      {openFloorForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl animate-fadeIn" onClick={() => {
            setOpenFloorForm(false);
            setEditFloorId(null);
            setFloorData(initialFloorData);
          }}></div>
          <div className="bg-[var(--bg-card)] w-full max-w-xl p-0 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-slideUp">
            <div className="p-8 pb-4 flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-3xl font-black text-[var(--text-secondary)] tracking-tight">{isEditingFloor ? "Modify Floor" : "Establish Floor"}</h3>
                <p className="text-[var(--text-card)] font-medium mt-1">Define properties floor levels</p>
              </div>
              <button onClick={() => {
                setOpenFloorForm(false);
                setEditFloorId(null);
                setFloorData(initialFloorData);
              }} className="p-3 bg-[var(--color-card)] hover:bg-white/10 rounded-2xl text-[var(--text-secondary)] transition-all"><X size={24} /></button>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-8 mb-6"></div>
            <form onSubmit={handleFloorSubmit} className="p-8 pt-0 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Select Property</label>
                  {floorData.propertyId && (
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                      Current Floors: {floors.filter(f => (f.propertyId?._id || f.propertyId) === floorData.propertyId).length}
                    </span>
                  )}
                </div>
                <select
                  name="propertyId"
                  value={floorData.propertyId}
                  onChange={handleFloorChange}
                  required
                  disabled={isEditingFloor}
                  className="w-full bg-[var(--color-card)] border border-white/10 rounded-2xl p-3.5 text-sm font-bold text-[var(--text-secondary)] focus:border-[var(--color-primary)] transition appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">-- Choose Property --</option>
                  {properties.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Floor Name/ID"
                    name="name"
                    value={floorData.name}
                    onChange={handleFloorChange}
                    placeholder="e.g. Ground Floor"
                    required
                    variant="formInput"
                  />
                  <Input
                    label="Floor Number"
                    name="floorNumber"
                    type="number"
                    value={floorData.floorNumber}
                    onChange={handleFloorChange}
                    placeholder="e.g. 0"
                    required
                    variant="formInput"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Additional Notes</label>
                  <textarea
                    name="description"
                    value={floorData.description}
                    onChange={handleFloorChange}
                    placeholder="Specific floor details..."
                    className="w-full bg-[var(--color-card)] border border-white/10 rounded-2xl p-4 text-sm font-medium text-[var(--text-secondary)] focus:border-[var(--color-primary)] transition resize-none min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <Button type="button" className="flex-1 py-4 bg-[var(--color-card)] text-[var(--text-secondary)] rounded-2xl font-bold" onClick={() => {
                  setOpenFloorForm(false);
                  setEditFloorId(null);
                  setFloorData(initialFloorData);
                }}>Cancel</Button>
                <Button type="primary" className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black shadow-xl shadow-blue-500/30 border-none" htmlType="submit">{isEditingFloor ? "UPDATE FLOOR" : "DEPLOY FLOOR"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Modal */}
      {openUnitForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl animate-fadeIn" onClick={() => {
            setOpenUnitForm(false);
            resetUnitForm();
          }}></div>
          <div className="bg-[var(--bg-card)] w-full max-w-2xl p-0 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-slideUp">
            <div className="p-8 pb-4 flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-3xl font-black text-[var(--text-secondary)] tracking-tight">{isEditingUnit ? "Modify Unit" : "Establish Unit"}</h3>
                <p className="text-[var(--text-card)] font-medium mt-1">Deploy individual living or commercial spaces</p>
              </div>
              <button onClick={() => {
                setOpenUnitForm(false);
                resetUnitForm();
              }} className="p-3 bg-[var(--color-card)] hover:bg-white/10 rounded-2xl text-[var(--text-secondary)] transition-all"><X size={24} /></button>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mx-8 mb-6"></div>
            <form onSubmit={handleUnitSubmit} className="p-8 pt-0 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Side - Identification */}
                <div className="space-y-4">
                  <div className="space-y-4 p-4 bg-[var(--color-card)] rounded-2xl border border-white/5">
                    <div className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-widest">Structural Link</div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-card)] uppercase">Target Property</label>
                      <select name="propertyId" value={unitData.propertyId} onChange={handleUnitChange} required className="w-full bg-[var(--bg-main)] border border-white/5 rounded-xl p-3 text-sm font-bold text-[var(--text-secondary)]">
                        <option value="">-- Choose Property --</option>
                        {properties.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[var(--text-card)] uppercase">Assigned Floor</label>
                        {unitData.floorId && (
                          <span className="text-[8px] font-black text-purple-500 bg-purple-500/5 px-2 py-0.5 rounded-md border border-purple-500/10 uppercase tracking-tighter">
                            Current Units: {units.filter(u => (u.floorId?._id || u.floorId) === unitData.floorId).length}
                          </span>
                        )}
                      </div>
                      <select name="floorId" value={unitData.floorId} onChange={handleUnitChange} required disabled={!selectedPropertyForUnit} className="w-full bg-[var(--bg-main)] border border-white/5 rounded-xl p-3 text-sm font-bold text-[var(--text-secondary)] disabled:opacity-30">
                        <option value="">-- Choose Floor --</option>
                        {filteredFloorsForUnit.map(f => <option key={f._id} value={f._id}>{f.name} (Lvl {f.floorNumber})</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input label="Unit Identifier" name="unitNumber" value={unitData.unitNumber} onChange={handleUnitChange} placeholder="e.g. A-101" required variant="formInput" />
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Space Categorize</label>
                      <select name="unitType" value={unitData.unitType} onChange={handleUnitChange} className="w-full bg-[var(--color-card)] border border-white/10 rounded-2xl p-3.5 text-sm font-bold text-[var(--text-secondary)] focus:border-[var(--color-primary)] transition appearance-none cursor-pointer">
                        {["Flat", "Shop", "Office", "Warehouse", "Parking"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <Input label="Net Area (Sq/Ft)" name="area" type="number" value={unitData.area} onChange={handleUnitChange} placeholder="e.g. 1200" required variant="formInput" />
                  </div>
                </div>

                {/* Right Side - Features & Financials */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Bedrooms" name="bedrooms" type="number" value={unitData.bedrooms} onChange={handleUnitChange} placeholder="3" variant="formInput" />
                    <Input label="Bathrooms" name="bathrooms" type="number" value={unitData.bathrooms} onChange={handleUnitChange} placeholder="2" variant="formInput" />
                  </div>

                  <div className="space-y-4 p-4 bg-[var(--color-card)] rounded-2xl border border-white/5">
                    <div className="text-[10px] font-black uppercase text-green-500 tracking-widest">Financial Configuration</div>
                    <Input label="Monthly Rent ($)" name="rentAmount" type="number" value={unitData.rentAmount} onChange={handleUnitChange} placeholder="1500" required variant="formInput" />
                    <div className="grid grid-cols-1">
                      <Input label="Deposit" name="securityDeposit" type="number" value={unitData.securityDeposit} onChange={handleUnitChange} placeholder="2000" variant="formInput" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center gap-3 p-4 bg-[var(--color-card)] rounded-2xl cursor-pointer hover:bg-white/5 transition border border-white/10">
                      <input type="checkbox" name="balcony" checked={unitData.balcony} onChange={handleUnitChange} className="w-5 h-5 rounded-lg accent-blue-500" />
                      <span className="text-sm font-bold text-[var(--text-secondary)] select-none">Private Balcony Access</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-[var(--color-card)] rounded-2xl cursor-pointer hover:bg-white/5 transition border border-white/10">
                      <input type="checkbox" name="utilityIncluded" checked={unitData.utilityIncluded} onChange={handleUnitChange} className="w-5 h-5 rounded-lg accent-blue-500" />
                      <span className="text-sm font-bold text-[var(--text-secondary)] select-none">Utilities Infrastructure Included</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <Button type="button" className="flex-1 py-4 bg-[var(--color-card)] text-[var(--text-secondary)] rounded-2xl font-bold" onClick={() => {
                  setOpenUnitForm(false);
                  resetUnitForm();
                }}>{isEditingUnit ? "Cancel" : "Discard"}</Button>
                <Button type="primary" className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl font-black shadow-xl shadow-purple-500/30 border-none" htmlType="submit">{isEditingUnit ? "UPDATE UNIT" : "DEPLOY UNIT"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default FloorUnit;
