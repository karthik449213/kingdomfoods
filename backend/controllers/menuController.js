import Menu from "../models/Menu.js";

// Add new dish
export const createMenuItem = async (req, res) => {
    try {
        const item = new Menu(req.body);
        await item.save();
        res.json({ message: "Menu item added", item });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all dishes
export const getMenu = async (req, res) => {
    try {
        const menu = await Menu.find();
        res.json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a dish
export const updateMenuItem = async (req, res) => {
    try {
        const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Updated", updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a dish
export const deleteMenuItem = async (req, res) => {
    try {
        await Menu.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
