# node js runtime
FROM node:22-alpine as BUILD

# set working dir inside container 
WORKDIR /app

#copy all package file into working dir 
COPY package*.json ./

RUN npm ci

COPY . .

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy app files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src /app/src

EXPOSE 8000

CMD ["node", "src/index.js"]