import models from '../models/index.js';

export const load_categories_page = async (req, res) => {
    const user = req.user;
    res.locals.user_username = user.username;
    const categories = await models.Category.findAll({ 
        where: {
            is_public: true
        },
        raw: true
    });
    res.locals.user_categories = categories;
    res.render('categories');
};

export const add_categories = async (req, res) => {
    try {
        const selectedOptions = req.body;
        selectedOptions.pop();
        if (!selectedOptions.includes("CREDIT ALERT")) { 
            selectedOptions.push("CREDIT ALERT");
        }

        const user = req.user;
        console.log(`SELECTED OPTIONS: ${selectedOptions}`);
      
        // Save each option as a separate row in the Category table
        for (const option of selectedOptions) {
            const category = await models.Category.findOne({ where: { name: option }});
            
            if (!category) {
                // Handle case where category doesn't exist
                console.log(`Category ${option} not found`);
                continue; // Skip to next iteration
            }

            // Try to create the user-category association
            try {
                await models.UserCategory.create({ 
                    name: option,
                    user_id: user.id,
                    category_id: category.id
                });
            } catch (err) {
                if (err.name === 'SequelizeUniqueConstraintError') {
                    // This user-category association already exists, just skip it
                    console.log(`User already has category ${option}`);
                    continue;
                }
                throw err; // Re-throw if it's a different error
            }
        }

        res.render('home');
    } catch (error) {
        console.error('Error creating categories:', error);
        res.status(500).json({ message: 'Error creating categories' });
    }
};
