const jwt = require('jsonwebtoken');

module.exports = {
    userObject: () => {
        let userObject = {
            email: null,
            password: null,
            login_type: null,
            user_name: null,
            age: null,
            gender: null,
            height: null,
            weight: null,
            fitness_goal: null,
            rate_of_weight: null,
            meals_per_day: null,
            fruit_per_day: null,
            weekly_plan_time: null,
            calorie_intake: null,
            location: null,
            latitude: null,
            longitude: null,
            food_prefrences: null,
            account_state: null,
            created_at: null,
            updated_at: null
        }
        return userObject
    },

    verifyJwtToke: async (token) => {
        let response;
        jwt.verify(token, 'fit-struction', (err, decoded) => {
            if (err) {
                response = err
            }
            else {
                response = decoded
            }
        });
        return response
    }
}