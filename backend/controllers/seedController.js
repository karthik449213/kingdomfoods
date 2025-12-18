import Category from "../models/category.model.js";
import SubCategory from "../models/SubCategory.js";

export const seedCategoriesAndSubcategories = async (req, res) => {
  try {
    // Check if data already exists
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      return res.status(400).json({ 
        message: 'Database already has categories. Seed skipped.',
        categoriesCount: existingCategories,
        subcategoriesCount: await SubCategory.countDocuments()
      });
    }

    // Test data
    const categoriesData = [
      {
        name: 'Fresh Juices',
        slug: 'fresh-juices',
        image: 'https://via.placeholder.com/300?text=Fresh+Juices',
        hidden: false
      },
      {
        name: 'Beverages',
        slug: 'beverages',
        image: 'https://via.placeholder.com/300?text=Beverages',
        hidden: false
      },
      {
        name: 'Desserts',
        slug: 'desserts',
        image: 'https://via.placeholder.com/300?text=Desserts',
        hidden: false
      },
      {
        name: 'Main Course',
        slug: 'main-course',
        image: 'https://via.placeholder.com/300?text=Main+Course',
        hidden: false
      }
    ];

    // Create categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✓ Created ${createdCategories.length} categories`);

    // Subcategories data - link them to created categories
    const subcategoriesData = [
      {
        name: 'Juices',
        slug: 'juices',
        image: 'https://via.placeholder.com/300?text=Juices',
        category: createdCategories[0]._id, // Fresh Juices
        hidden: false
      },
      {
        name: 'Mix Fruit Blend',
        slug: 'mix-fruit-blend',
        image: 'https://via.placeholder.com/300?text=Mix+Fruit',
        category: createdCategories[0]._id, // Fresh Juices
        hidden: false
      },
      {
        name: 'Cold Drinks',
        slug: 'cold-drinks',
        image: 'https://via.placeholder.com/300?text=Cold+Drinks',
        category: createdCategories[1]._id, // Beverages
        hidden: false
      },
      {
        name: 'Hot Drinks',
        slug: 'hot-drinks',
        image: 'https://via.placeholder.com/300?text=Hot+Drinks',
        category: createdCategories[1]._id, // Beverages
        hidden: false
      },
      {
        name: 'Ice Cream',
        slug: 'ice-cream',
        image: 'https://via.placeholder.com/300?text=Ice+Cream',
        category: createdCategories[2]._id, // Desserts
        hidden: false
      },
      {
        name: 'Cakes',
        slug: 'cakes',
        image: 'https://via.placeholder.com/300?text=Cakes',
        category: createdCategories[2]._id, // Desserts
        hidden: false
      },
      {
        name: 'Vegetarian',
        slug: 'vegetarian',
        image: 'https://via.placeholder.com/300?text=Vegetarian',
        category: createdCategories[3]._id, // Main Course
        hidden: false
      },
      {
        name: 'Non-Vegetarian',
        slug: 'non-vegetarian',
        image: 'https://via.placeholder.com/300?text=Non-Vegetarian',
        category: createdCategories[3]._id, // Main Course
        hidden: false
      }
    ];

    // Create subcategories
    const createdSubcategories = await SubCategory.insertMany(subcategoriesData);
    console.log(`✓ Created ${createdSubcategories.length} subcategories`);

    return res.status(201).json({
      message: 'Database seeded successfully',
      categories: createdCategories.length,
      subcategories: createdSubcategories.length,
      data: {
        categories: createdCategories,
        subcategories: createdSubcategories
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      message: 'Error seeding database',
      error: error.message 
    });
  }
};

export const clearCategoriesAndSubcategories = async (req, res) => {
  try {
    const deletedCategories = await Category.deleteMany({});
    const deletedSubcategories = await SubCategory.deleteMany({});

    return res.json({
      message: 'Categories and subcategories cleared',
      deletedCategories: deletedCategories.deletedCount,
      deletedSubcategories: deletedSubcategories.deletedCount
    });
  } catch (error) {
    console.error('Clear error:', error);
    res.status(500).json({ 
      message: 'Error clearing database',
      error: error.message 
    });
  }
};
