FROM node:20-alpine AS build
WORKDIR /workspace
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL=/api
ARG VITE_SENTRY_DSN=
ENV VITE_API_URL=${VITE_API_URL} VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
RUN npm run build

FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html
EXPOSE 80
