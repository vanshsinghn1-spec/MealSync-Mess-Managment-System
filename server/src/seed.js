/**
 * Database Seed Script — Populates initial data for development
 * Run: npm run seed
 */
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config/env');

const User = require('./models/User');
const MessHall = require('./models/MessHall');
const VegMenu = require('./models/VegMenu');
const FeatureToggle = require('./models/FeatureToggle');
const Feedback = require('./models/Feedback');

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const evenWeekMenuData = {
  Monday: {
    breakfast: ["Poori", "Aloo Masala Curry", "BBJ, Boiled Groundnuts", "Banana (1) / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Pulkha, Garlic Tomato Curry", "Kerala Sadiya Avial", "Rice, Vathakolambu, Curd", "Fryums, Pickle", "Sugar, Salt, Ghee, Podi", "Seasonal Fruit Juice, Onion"],
    snacks: ["Sundal (Boiled channa black & green gram)", "Tea, Coffee, Milk, Sugar, Raagi Malt Powder"],
    dinner: ["Tawa Chapathi, Channa Masala", "Rice, Sambar, Rasam, Cauliflower Peas Poriyal", "Buttermilk, Fryums", "Boondi Laddu (1)"]
  },
  Tuesday: {
    breakfast: ["Ragi Dosa, Upma", "Sambar, Groundnut Chutney", "BBJ, Sprouts", "Seasonal Cut Fruits*** / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Tawa Chapathi, Dum Aloo", "Andhra Tomato Dal, Greens Poriyal", "Jeera Rice, Rice, Rasam, Curd", "Papad, Pickle", "Sugar, Salt, Ghee, Podi", "Salad, Onion"],
    snacks: ["Onion Pakoda", "Tea, Coffee, Milk, Sugar, Boost Sachets"],
    dinner: ["Idli, Sambar, Karam Podi, Tomato Onion Chutney, Ghee", "Lemon Rice, Curd Rice, Potato Poriyal", "Pickle", "Sweet Pongal***"]
  },
  Wednesday: {
    breakfast: ["Masala Dosa", "Sambar, Tomato Onion Chutney", "BBJ, Boiled Groundnuts", "Banana (1) / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Pulkha, Yellow Channa Dal Masala", "Kovakai Fry", "Rice, Sambar, Rasam, Curd", "Fryums, Pickle", "Sugar, Salt, Ghee, Podi", "Seasonal Fruit Juice, Onion"],
    snacks: ["Banana Bajji (3), Kadalai Chutney", "Tea, Coffee, Milk, Sugar, Raagi Malt Powder"],
    dinner: ["Special Dinner", "Naan / Roti with Paneer Butter Masala", "Hyderabadi Veg Biryani / Pulao", "Raita, Lemon Juice", "Ice Cream / Fruit Custard", "Fresh Fruits"]
  },
  Thursday: {
    breakfast: ["Upma, Poha", "Mysore Bonda (3), Coconut Chutney", "BBJ, Sprouts", "Seasonal Cut Fruits*** / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Tawa Chapathi, Paneer Peas Curry", "Spinach Kootu", "Rice, Sambar, Rasam, Curd", "Fryums, Pickle", "Sugar, Salt, Ghee, Podi", "Salad, Onion"],
    snacks: ["Sweet Corn (half piece-6cm)", "Tea, Coffee, Milk, Sugar, Boost Sachets"],
    dinner: ["Tawa Chapathi, Veg Biryani", "Aloo Curry, Raitha", "Buttermilk", "Pineapple Kesari***"]
  },
  Friday: {
    breakfast: ["Rava Idly, Vada (3)", "Sambar, Tomato Onion Chutney", "BBJ, Boiled Groundnuts", "Banana (1) / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Phulka, Aloo Masala Curry", "Hyderabadi Veg Pulao, Raita", "Gongura Chutney, Papad", "Sugar, Salt, Ghee, Podi", "Seasonal Fruit Juice, Onion"],
    snacks: ["Mix Veg Maggi (130gm), Tomato Sauce", "Tea, Coffee, Milk, Sugar, Raagi Malt Powder"],
    dinner: ["Chole Bature, Idiyappam", "Bagara Rice, Black Channa Curry", "Buttermilk, Onion", "Paruppu Payasam with Jaggery"]
  },
  Saturday: {
    breakfast: ["Methi Paratha", "Kabuli Channa Masala", "BBJ, Sprouts", "Seasonal Cut Fruits*** / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Tawa Chapathi, Baigan Methi Curry", "Chilli Soya Bean Dry***, Perugu Pachadi", "Rice, Sambar, Rasam", "Papad, Pickle", "Sugar, Salt, Ghee, Podi", "Banana Juice, Onion"],
    snacks: ["Aloo Samosa (2) (with peas), Tomato Sauce, Mint Chutney", "Tea, Coffee, Milk, Sugar, Boost Sachets"],
    dinner: ["Millet Dosa, Peanut Chutney", "Plain Rice, Mixed Dal", "Buttermilk, Papad", "Bread Halwa***"]
  },
  Sunday: {
    breakfast: ["Onion Carrot Uttapam", "Sambar, Coconut Chutney", "BBJ, Sprouts", "Seasonal Cut Fruits*** / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Tawa Chapathi, Sev Tomato Gravy", "Hyderabadi Paneer Biryani, Raitha / Hyderabadi Chicken Biryani, Raitha", "Ice Cream (1)", "Salad, Onion"],
    snacks: ["Bhel Puri", "Tea, Coffee, Milk, Sugar, Boost Sachets"],
    dinner: ["Peanut Coconut Rice, Veg Kurma", "Phulka, Gutti Vankaya Curry", "Curd", "Gulab Jamun (2)"]
  }
};

const oddWeekMenuData = {
  Monday: {
    breakfast: ["Pongal, Vada (3)", "Sambar, Coconut Chutney", "BBJ, Sprouts", "Banana (1) / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Pulkha, Dal Makhani", "Plantain Poriyal", "Rice, Sambar, Rasam, Curd", "Pickle, Papad", "Sugar, Salt, Ghee, Podi", "Seasonal Fruit Juice, Onion"],
    snacks: ["Pasta", "Tea, Coffee, Milk, Sugar, Boost Sachets"],
    dinner: ["Chole Bature, Onion Mirch Salad", "Rice, Snake Gourd Kootu", "Curd, Rasam", "Banana (1)"]
  },
  Tuesday: {
    breakfast: ["Wheat Dosa (or) Pesarattu", "Sambar, Tomato Onion Chutney", "BBJ, Boiled Groundnuts", "Seasonal Cut Fruits*** / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Tawa Chapathi, Dum Aloo", "Beans Carrot Poriyal", "Rice, Panchratan Dal, Rasam, Curd, Fryums", "Pickle", "Sugar, Salt, Ghee, Podi", "Salad, Onion"],
    snacks: ["Masala Vada (3), Pottukadalai Chutney", "Tea, Coffee, Milk, Sugar, Raagi Malt Powder"],
    dinner: ["Tawa Chapathi, Channa Masala", "Rice, Sambar, Beetroot Poriyal, Buttermilk", "Fryums", "Bread Halwa"]
  },
  Wednesday: {
    breakfast: ["Puri", "Channa Masala", "BBJ, Sprouts", "Banana (1) / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Pulkha, Soya Curry", "Onion Pakoda***, Perugu Pachadi", "Rice, Rasam, Puli Kolambu, Papad, Cabbage Moongdal Coconut Poriyal", "Pickle", "Sugar, Salt, Ghee, Podi", "Seasonal Fruit Juice, Onion"],
    snacks: ["Boiled Groundnuts Chat", "Tea, Coffee, Milk, Sugar, Boost Sachets"],
    dinner: ["Phulka, Kambu (Pearl Millet) Idli", "Sambar, Tomato Onion Chutney", "Dal Fry, Buttermilk", "Sabudhana Kheer, Kulfi (1) (Malai / Pista / Mango / Strawberry)"]
  },
  Thursday: {
    breakfast: ["Wheat Rava Upma, Poha", "Mysore Bonda (3), Groundnut Chutney", "BBJ, Boiled Groundnuts", "Seasonal Cut Fruits*** / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Tawa Chapathi, Kadai Paneer***", "Rice, Masala Sambar, Curd, Fryums, Spinach Kootu", "Pickle", "Sugar, Salt, Ghee, Podi", "Salad, Onion"],
    snacks: ["Channa Chat", "Tea, Coffee, Milk, Sugar, Raagi Malt Powder"],
    dinner: ["Flavoured Chapati, Paneer Kofta Curry", "Rice, Sambar, Rasam, Kovakai Poriyal", "Salad, Buttermilk", "Vermicelli Payasam"]
  },
  Friday: {
    breakfast: ["Idli, Vada (3)", "Sambar, Coconut Chutney", "BBJ, Sprouts", "Banana (1) / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Phulka, Rajma Curry", "Keerai Sambar", "Rice, Rasam, Curd, Fryums, Pumpkin Kootu", "Gongura Chutney", "Sugar, Salt, Ghee, Podi", "Seasonal Fruit Juice, Onion"],
    snacks: ["Boiled Green Moong Dal", "Tea, Coffee, Milk, Sugar, Boost Sachets"],
    dinner: ["Set Dosa, Veg Pulao", "Vada Curry", "Raitha, Buttermilk", "Kesari Bath***"]
  },
  Saturday: {
    breakfast: ["Aloo Paratha", "Channa Masala, Curd, Pickle", "BBJ, Boiled Groundnuts", "Seasonal Cut Fruits*** / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Tawa Chapathi", "Lauki Chana Dal, Gobi 65***", "Rice, Rasam, Curd, Tomato Andhra Dal, Papad, Plantain Stem Kootu", "Pickle", "Sugar, Salt, Ghee, Podi", "Banana Juice, Onion"],
    snacks: ["Millet Puttu", "Tea, Coffee, Milk, Sugar, Raagi Malt Powder"],
    dinner: ["Pulka, Channa Peas Palak", "Sambar Rice, Curd Rice, Soya Chilli", "Kara Boondi, Pickle", "Gulab Jamun (2)"]
  },
  Sunday: {
    breakfast: ["Rava Dosa, Semiya Upma", "Sambar, Groundnut Chutney", "BBJ, Boiled Groundnuts", "Seasonal Cut Fruits*** / Boiled Egg (1)", "Tea, Coffee, Milk, Sugar, Salt"],
    lunch: ["Tawa Chapathi, Palak Paneer Curry / Chicken Curry", "Veg Biryani, Raitha", "Badusha (1)", "Seasonal Fruit Juice, Ice Cream (1)", "Salad, Onion"],
    snacks: ["Pani Puri (6), Green Chutney, Tamarind Chutney", "Tea, Coffee, Milk, Sugar, Raagi Malt Powder"],
    dinner: ["Chapatti, Mix Veg Curry (Punjabi style)", "Tamarind Rice, Buttermilk, Aloo Bhujiya Sabhji, Fryums", "Pickle", "Seasonal Cut Fruits***, Turmeric Milk"]
  }
};

const mealIcons = {
  breakfast: '☀️',
  lunch: '🌤️',
  snacks: '🌅',
  dinner: '🌙'
};

async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      MessHall.deleteMany({}),
      VegMenu.deleteMany({}),
      FeatureToggle.deleteMany({}),
      Feedback.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing collections');

    // Create Mess Halls
    const [mess1, mess2] = await MessHall.insertMany([
      { name: 'Mess Sai', slug: 'mess-1', location: 'Block A, IIITDM Kancheepuram', capacity: 500, isActive: true },
      { name: 'Mess Sheila', slug: 'mess-2', location: 'Block B, IIITDM Kancheepuram', capacity: 500, isActive: true }
    ]);
    console.log('🏢 Created mess halls (Mess Sai & Mess Sheila)');

    // Create default users (Mongoose pre-save hook will hash this plain text value)
    const passwordHash = 'password123';

    const admin = await User.create({
      email: 'admin@iiitdm.ac.in',
      passwordHash,
      role: 'admin',
      fullName: 'Admin User',
      messId: mess1._id
    });

    const official1 = await User.create({
      email: 'mess1@iiitdm.ac.in',
      passwordHash,
      role: 'mess_official',
      fullName: 'Mess Sai Representative',
      messId: mess1._id
    });

    const official2 = await User.create({
      email: 'mess2@iiitdm.ac.in',
      passwordHash,
      role: 'mess_official',
      fullName: 'Mess Sheila Representative',
      messId: mess2._id
    });

    const student = await User.create({
      email: 'cs23i1028@iiitdm.ac.in',
      passwordHash,
      role: 'student',
      fullName: 'Vansh Singh',
      rollNumber: 'CS23I1028',
      phone: '9876543210',
      messId: mess1._id
    });

    console.log('👤 Created default users (admin, officials, student)');

    // Generate menus
    const vegMenuDocs = [];
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];

    // For Mess Sai (Mess 1) & Mess Sheila (Mess 2)
    [mess1, mess2].forEach(mess => {
      // Seed Even Week
      for (const day of daysOfWeek) {
        for (const meal of meals) {
          const itemsRaw = evenWeekMenuData[day]?.[meal] || ["Special Meal"];
          const items = itemsRaw.map(name => ({
            name,
            icon: name.toLowerCase().includes('tea') || name.toLowerCase().includes('coffee') || name.toLowerCase().includes('milk') ? '☕' : 
                  name.toLowerCase().includes('rice') || name.toLowerCase().includes('jeera') ? '🍚' :
                  name.toLowerCase().includes('chapathi') || name.toLowerCase().includes('roti') || name.toLowerCase().includes('phulka') ? '🫓' :
                  name.toLowerCase().includes('fruit') || name.toLowerCase().includes('banana') ? '🍎' :
                  name.toLowerCase().includes('curry') || name.toLowerCase().includes('dal') || name.toLowerCase().includes('sambar') ? '🍲' : '🍽️'
          }));

          vegMenuDocs.push({
            messId: mess._id,
            day,
            weekType: 'even',
            meal,
            items
          });
        }
      }

      // Seed Odd Week
      for (const day of daysOfWeek) {
        for (const meal of meals) {
          const itemsRaw = oddWeekMenuData[day]?.[meal] || ["Special Meal"];
          const items = itemsRaw.map(name => ({
            name,
            icon: name.toLowerCase().includes('tea') || name.toLowerCase().includes('coffee') || name.toLowerCase().includes('milk') ? '☕' : 
                  name.toLowerCase().includes('rice') || name.toLowerCase().includes('jeera') ? '🍚' :
                  name.toLowerCase().includes('chapathi') || name.toLowerCase().includes('roti') || name.toLowerCase().includes('phulka') ? '🫓' :
                  name.toLowerCase().includes('fruit') || name.toLowerCase().includes('banana') ? '🍎' :
                  name.toLowerCase().includes('curry') || name.toLowerCase().includes('dal') || name.toLowerCase().includes('sambar') ? '🍲' : '🍽️'
          }));

          vegMenuDocs.push({
            messId: mess._id,
            day,
            weekType: 'odd',
            meal,
            items
          });
        }
      }
    });

    await VegMenu.insertMany(vegMenuDocs);
    console.log(`🍽️  Seeded ${vegMenuDocs.length} menu items (bi-weekly odd/even for both messes)`);

    // Create feature toggles
    await FeatureToggle.create({
      featureName: 'mess_switching',
      isEnabled: true
    });
    console.log('🔧 Created feature toggles');

    // Create some initial mock feedback ratings so we immediately see stars on the public dashboard
    const today = new Date();
    // Helper to generate ratings
    const mockFeedbacks = [];
    const student2 = await User.create({
      email: 'cs21b002@iiitdm.ac.in',
      passwordHash,
      role: 'student',
      fullName: 'Aarav Mehta',
      rollNumber: 'CS21B002',
      phone: '9876543211',
      messId: mess1._id
    });
    const student3 = await User.create({
      email: 'cs21b003@iiitdm.ac.in',
      passwordHash,
      role: 'student',
      fullName: 'Diya Sharma',
      rollNumber: 'CS21B003',
      phone: '9876543212',
      messId: mess2._id
    });

    // Populate feedback for some common items across breakfast, lunch, dinner for both messes
    const testItems = [
      { name: "Poori", rating: 4.5, comments: ["Really soft poori", "Excellent aloo curry accompaniment"] },
      { name: "Masala Dosa", rating: 4.8, comments: ["Crispy and fresh!", "Sambar is delicious"] },
      { name: "Hyderabadi Chicken Biryani", rating: 4.9, comments: ["Exceptional taste!", "Loved the spice level"] },
      { name: "Hyderabadi Paneer Biryani", rating: 4.3, comments: ["Good paneer soft text", "A bit oily"] },
      { name: "Chole Bature", rating: 4.2, comments: ["Bature was soft, chole tasty", "A bit heavy for dinner"] },
      { name: "Gulab Jamun (2)", rating: 4.7, comments: ["Warm and perfect sweet level"] }
    ];

    const feedbackList = [];
    
    // Add mock ratings directly matching today's possible meals
    // We will seed ratings for various menu items directly
    const foodRatingSeeds = [
      { messId: mess1._id, studentId: student._id, meal: 'breakfast', items: [{ foodItem: 'Poori', rating: 5, comment: 'Amazing soft poori!' }, { foodItem: 'Aloo Masala Curry', rating: 4, comment: 'Nice curry' }] },
      { messId: mess1._id, studentId: student2._id, meal: 'breakfast', items: [{ foodItem: 'Poori', rating: 4, comment: 'Good' }, { foodItem: 'Aloo Masala Curry', rating: 5, comment: 'Excellent' }] },
      { messId: mess1._id, studentId: student._id, meal: 'lunch', items: [{ foodItem: 'Pulkha, Garlic Tomato Curry', rating: 4, comment: 'Nice and hot' }, { foodItem: 'Rice, Vathakolambu, Curd', rating: 3, comment: 'Average' }] },
      { messId: mess2._id, studentId: student3._id, meal: 'breakfast', items: [{ foodItem: 'Poori', rating: 4 }, { foodItem: 'Aloo Masala Curry', rating: 4 }] }
    ];

    for (const feed of foodRatingSeeds) {
      feedbackList.push({
        studentId: feed.studentId,
        messId: feed.messId,
        date: today,
        meal: feed.meal,
        items: feed.items,
        overallComment: 'Healthy meal, well cooked.'
      });
    }

    await Feedback.insertMany(feedbackList);
    console.log('⭐ Seeded mock student feedback ratings');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:         admin@iiitdm.ac.in / password123');
    console.log('   Mess Official: mess1@iiitdm.ac.in / password123 (Sai) or mess2@iiitdm.ac.in (Sheila)');
    console.log('   Student:       cs23i1028@iiitdm.ac.in / password123');
    console.log('   Atlas database: mealsync');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
