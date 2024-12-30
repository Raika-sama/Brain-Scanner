FROM node:18

ENV JWT_SECRET=""
ENV JWT_EXPIRES_IN=24h
ENV TOKEN_PREFIX=Bearer


WORKDIR /app




COPY package*.json ./
COPY .env ./ 
RUN npm install


COPY . .



EXPOSE 5000

CMD ["node", "app.js"]