const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');

const users = [
    { name: 'Super User', email: 'admin@email.com', password: 'Aa12345678', role: 'admin', accountStatus: 'active' },
    { name: 'Moderator User', email: 'mod@email.com', password: 'Aa12345678', role: 'moderator', accountStatus: 'active' },
    { name: 'John Doe', email: 'john.doe@gmail.com', password: 'Aa12345678', role: 'user', accountStatus: 'active' },
    { name: 'Jane Doe', email: 'jane.doe@gmail.com', password: 'Aa12345678', role: 'user', accountStatus: 'active' },
];

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

exports.seedUsers = async () => {
    try {
        for (const user of users) {
            let existingUser = await User.findOne({ email: user.email });
            if (!existingUser) {
                const hashedPassword = await hashPassword(user.password);
                await new User({ ...user, password: hashedPassword }).save({ validateBeforeSave: false });
                console.log(`Seeding user: ${user}`);
            } else {
                console.warn(`User not seeded: ${existingUser.email}`)
            }
        }
    } catch (error) {
        console.error('Error seeding users:', error.message);
    }
}