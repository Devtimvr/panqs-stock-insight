# ----------- BUILD STAGE -----------
FROM node:18 as build
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Dependências — usando fallback para problemas de peer dependencies
RUN npm install --legacy-peer-deps || npm install

# Copia resto do projeto
COPY . .

# Gera a build
RUN npm run build

# ----------- RUNTIME STAGE (CADDY) -----------
FROM caddy:2

# Copia o Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Copia a build para o servidor do Caddy
COPY --from=build /app/dist /usr/share/caddy
