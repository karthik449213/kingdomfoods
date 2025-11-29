const Menu = require("../models/Menu");

// Add new dish
exports.createMenuItem = async (req, res) => {
    try {
        const item = new Menu(req.body);
        await item.save();
        res.json({ message: "Menu item added", item });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all dishes
exports.getMenu = async (req, res) => {
    try {
        const menu = await Menu.find();
        res.json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a dish
exports.updateMenuItem = async (req, res) => {
    try {
        const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Updated", updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a dish
exports.deleteMenuItem = async (req, res) => {
    try {
        await Menu.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
