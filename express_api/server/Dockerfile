FROM oven/bun:latest AS build

WORKDIR /app

COPY bun.lock .
COPY package.json .

RUN bun install --frozen-lockfile

COPY index.js ./index.js 

# compile everything to a binary called cli which includes the bun runtime
RUN bun build ./index.js --outdir ./build

FROM oven/bun:latest

WORKDIR /app

# copy the compiled binary from the build image
COPY --from=build /app/build /app/build

# execute the binary!
CMD ["bun", "/app/build/index.js"]
