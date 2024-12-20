export const config = {
    port: process.env.PORT || 3001,
    token_key: process.env.ACCESS_TOKEN_SECRET_KEY || '',
    client_id: process.env.CLIENT_ID || '',
    client_secret: process.env.CLIENT_SECRET || '',
    mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/theme-manager',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: 60 * 60 * 24 // 24 hours
    },
};
