import models, { sequelize } from './models/index.js'

async function createInitialUser() {
    try {
        // const newUser = await models.User.create({
        //     username: 'Akin',
        //     telegram_id: 2345,
        //     password_hash: 'HumanBeing'
        // });
        // console.log('New user created:', newUser);
        // const category_ids = [];
        const categories = ["ounje", "groceries", "Black Tax", "Subscription", "Phone", "Data", "CREDIT ALERT"];
        for (const category of categories) {
            const newCategory = await models.Category.create({ 
                name: category,
                is_public: true 
            });
            // category_ids.push(newCategory.id);
        }

        // const newUserCategory = await models.UserCategory.create({ 
        //     user_id: newUser.id,
        //     category_id: category_ids[1]
        //  });


        // const newTransaction = await models.Transaction.create({
        //     transaction_text: 'sent eben 1000 naira for support',
        //     transaction_type: 'Debit',
        //     amount: 1000,
        //     recipient: 'eben',
        //     user_id: newUser.id,
        //     usercategory_id: newUserCategory.id
        // });
        // console.log('New Txn created:', newTransaction);
        // const newEmbedding = await models.Embedding.create({
        //     transaction_id: newTransaction.id,
        //     data: [0.5, 1.2, 0.8]           
        // });
        // console.log('New Txn created:', newEmbedding);
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        await sequelize.sync({ alter:true });
        console.log('Database synchronized successfully.');
        // Call the function to create the user
        await createInitialUser();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

export default initializeDatabase;