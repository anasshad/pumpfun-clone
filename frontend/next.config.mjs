/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental:{
        serverActions:{
            allowedOrigins: ['expert-yodel-jrrxq96xxr9fq59q-3000.app.github.dev', 'localhost:3000']
        }
    },
    images:{
        domains: ["beige-grateful-cougar-946.mypinata.cloud"]
    }
};

export default nextConfig;
