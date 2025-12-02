"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "@/utils/api";

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  subcategory?: {
    _id: string;
    name: string;
    category?: { _id: string; name: string } | string;
  } | string;
}

export default function AdminMenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<any>>([]);
  const [subcategories, setSubcategories] = useState<Array<any>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterSubcategory, setFilterSubcategory] = useState<string>("");
  const [filterSubcategoryList, setFilterSubcategoryList] = useState<Array<any>>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Fetch menu items
  const loadMenu = async () => {
    try {
      // use populated menu dishes API to get subcategory/category and image
      const res = await axios.get(`${API_BASE}/api/menu/dishes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ensure we always set an array so `menu.map` is safe
      const data = res?.data;
      if (Array.isArray(data)) setMenu(data);
      else if (data && Array.isArray(data.dishes)) setMenu(data.dishes);
      else setMenu([]);
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadMenu();
    // load categories for classification
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/menu/categories`);
        setCategories(res.data || []);
      } catch (e) {
        console.log("Could not load categories", e);
      }
    })();
  }, []);

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setForm({ ...form, category: "" });
    try {
      const res = await axios.get(`${API_BASE}/api/menu/subcategories/${categoryId}`);
      setSubcategories(res.data || []);
    } catch (e) {
      console.log("Could not load subcategories", e);
      setSubcategories([]);
    }
  };

  const handleFilterCategoryChange = async (categoryId: string) => {
    setFilterCategory(categoryId);
    setFilterSubcategory("");
    if (categoryId) {
      try {
        const res = await axios.get(`${API_BASE}/api/menu/subcategories/${categoryId}`);
        setFilterSubcategoryList(res.data || []);
      } catch (e) {
        console.log("Could not load filter subcategories", e);
        setFilterSubcategoryList([]);
      }
    } else {
      setFilterSubcategoryList([]);
    }
  };

  const getFilteredMenu = () => {
    if (!filterCategory && !filterSubcategory) return menu;
    return menu.filter((item) => {
      const sub = item.subcategory as any;
      if (!sub || typeof sub === "string") return false;
      if (filterSubcategory) return sub._id === filterSubcategory;
      if (filterCategory) {
        const cat = sub.category;
        const catId = typeof cat === "string" ? cat : (cat?._id || "");
        return catId === filterCategory;
      }
      return true;
    });
  };

  // Handle input changes
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item._id);
    // determine category id from populated subcategory
    let catId = "";
    let subcatId = "";
    if (item.subcategory && typeof item.subcategory !== "string") {
      subcatId = item.subcategory._id || "";
      const cat = item.subcategory.category;
      if (cat) catId = typeof cat === "string" ? cat : (cat._id || "");
    }

    setSelectedCategory(catId);
    // fetch subcategories for this category so the select is populated
    if (catId) {
      axios.get(`${API_BASE}/api/menu/subcategories/${catId}`).then(res => {
        setSubcategories(res.data || []);
      }).catch(e => { console.log('Could not load subcategories for edit', e); setSubcategories([]); });
    }

    setForm({
      name: item.name || "",
      price: String(item.price ?? ""),
      category: subcatId,
      description: item.description || "",
    });
    setPreview(item.image || null);
    setFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", category: "", description: "" });
    setFile(null);
    setPreview(null);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description);
      if (form.category) formData.append("subcategoryId", form.category);
      if (file) formData.append("image", file);

      await axios.put(`${API_BASE}/api/menu/dishes/${editingId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Dish updated");
      cancelEdit();
      loadMenu();
    } catch (err: any) {
      console.log("Update error", err?.response || err);
      alert("Error updating dish");
    }
  };

  // Add dish (with image upload)
  const handleAdd = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description);
      // expect subcategoryId (menuControllers.createDish)
      if (!form.category) throw new Error("Please select a subcategory");
      formData.append("subcategoryId", form.category);
      if (file) formData.append("image", file);

      await axios.post(`${API_BASE}/api/menu/dishes`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Dish Added");
      // reset form
      setForm({ name: "", price: "", category: "", description: "" });
      setFile(null);
      loadMenu();
    } catch (err: any) {
      alert("Error Adding Dish");
      console.log(err?.response || err);
    }
  };

  // Delete dish
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/api/menu/dishes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Dish Deleted");
      loadMenu();
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Menu Management</h2>

      {/* Add Menu Form */}
      <div style={{ marginTop: "20px" }}>
        <h3>Add Dish</h3>

        <input
          type="text"
          name="name"
          placeholder="Dish Name"
          value={form.name}
          onChange={handleChange}
        /><br /><br />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        /><br /><br />

        {/* Category -> Subcategory selection */}
        <label>Category</label><br />
        <select
          value={selectedCategory}
          onChange={(e) => handleCategorySelect(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <br /><br />

        <label>Subcategory</label><br />
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select subcategory</option>
          {subcategories.map((s: any) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <br /><br />

        {/* Image upload */}
        <label>Image</label><br />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <div style={{ marginTop: 8 }}>
            <img src={preview} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover' }} />
          </div>
        )}
        <br /><br />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        /><br /><br />

        {editingId ? (
          <>
            <button onClick={handleUpdate}>Update Dish</button>
            <button onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancel</button>
          </>
        ) : (
          <button onClick={handleAdd}>Add Dish</button>
        )}
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* Filter Menu Items */}
      <h3>Filter Menu Items</h3>
      <div style={{ marginBottom: "20px" }}>
        <label>Filter by Category</label><br />
        <select value={filterCategory} onChange={(e) => handleFilterCategoryChange(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <br /><br />

        {filterCategory && (
          <>
            <label>Filter by Subcategory</label><br />
            <select value={filterSubcategory} onChange={(e) => setFilterSubcategory(e.target.value)}>
              <option value="">All subcategories</option>
              {filterSubcategoryList.map((s: any) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <br /><br />
          </>
        )}
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* Display All Menu Items */}
      <h3>Menu Items {filterCategory || filterSubcategory ? `(Filtered)` : ""}</h3>

      {(() => {
        const filtered = getFilteredMenu();
        return filtered.length === 0 ? (
          <p>No dishes found.</p>
        ) : (
          filtered.map((item) => {
            const sub = item.subcategory as any;
            const classification = (() => {
              if (!sub) return item.category || "";
              if (typeof sub === "string") return sub;
              const catName = typeof sub.category === "string" ? sub.category : (sub.category?.name || "");
              return `${catName} / ${sub.name}`;
            })();

            return (
              <div key={item._id} style={{ marginBottom: "15px", display: 'flex', gap: 12, alignItems: 'center' }}>
                {item.image && (
                  <img src={item.image} alt={item.name} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                )}
                <div>
                  <strong>{item.name}</strong> — ₹{item.price}
                  <br />
                  <small>{classification}</small>
                  <br />
                  <button onClick={() => startEdit(item)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(item._id)}>Delete</button>
                </div>
              </div>
            );
          })
        );
      })()}
    </div>
  );
}
