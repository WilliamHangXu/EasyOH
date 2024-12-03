FROM node:18-alpine as BUILD_IMAGE

WORKDIR /app/react-app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

# multi-stage build. Reduce size and won't expose code.
FROM node:18-alpine as PRODUCTION_IMAGE
WORKDIR /app/react-app

# copying from build_image to dist folder. This folder is Vite used to generate build files
COPY --from=BUILD_IMAGE /app/react-app/dist/ /app/react-app/dist/

EXPOSE 8080

COPY package.json .
COPY vite.config.ts .
RUN npm install typescript

CMD ["npm", "run", "preview"]