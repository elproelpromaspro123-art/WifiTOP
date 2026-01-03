FROM python:3.11-slim

WORKDIR /app

# Instalar Node.js y npm
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Instalar speedtest-cli
RUN pip install speedtest-cli

# Copiar solo el archivo del servidor
COPY server.js .

# Puerto
EXPOSE 3001

# Ejecutar solo el servidor de speedtest
CMD ["node", "server.js"]
