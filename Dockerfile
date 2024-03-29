## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Move source files
COPY src ./src
COPY tsconfig.json   .

# Build project
RUN yarn build

## production runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --production --frozen-lockfile
RUN yarn add sharp --ignore-engines

# Move build files
COPY --from=build-runner /tmp/app/build /app/build

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s \
    CMD wget -q --tries=1 -O /dev/null http://localhost:3000/auth/test || exit 1

# Start bot
CMD [ "npm", "run", "start" ]
