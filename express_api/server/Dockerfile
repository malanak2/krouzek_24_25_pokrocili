FROM oven/bun:latest
# C:/app
# cd /app
WORKDIR /app

COPY bun.lock .
COPY index.js .
COPY package-lock.json .
COPY package.json .

RUN bun install

RUN bun build ./index.js --compile

# execute the binary!
CMD ["./index"]
