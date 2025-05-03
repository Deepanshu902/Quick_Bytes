# node js runtime
FROM node:22-alpine

# set working dir inside container 
WORKDIR /app

#copy all package file into working dir 
COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8000

CMD ["node", "src/index.js"]