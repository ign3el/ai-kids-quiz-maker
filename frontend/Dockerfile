FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Expose Vite to local network so we can access it from Windows host
CMD ["npm", "run", "dev", "--", "--host"]
