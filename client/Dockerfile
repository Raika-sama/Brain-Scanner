# Stage 1: Build stage
FROM node:18 as build

WORKDIR /app



COPY package*.json ./
# Installa esplicitamente le dipendenze di Material-UI

RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Copia configurazione nginx personalizzata per gestire JWT
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]