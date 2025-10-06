FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

RUN npm run build

# Run the development server
CMD ["npm", "run", "preview"]
