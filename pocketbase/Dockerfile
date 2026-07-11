# PocketBase — source of truth for products, orders, bookings + admin dashboard.
FROM alpine:3.20

# Bump this when you want a newer PocketBase. Verified schema/hook APIs target 0.22.x.
ARG PB_VERSION=0.22.21

RUN apk add --no-cache ca-certificates unzip wget

WORKDIR /pb
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
  && unzip "pocketbase_${PB_VERSION}_linux_amd64.zip" \
  && rm "pocketbase_${PB_VERSION}_linux_amd64.zip"

# App logic + schema (mounted as volumes in compose too, copied here so the image is self-contained).
COPY pb_hooks /pb/pb_hooks
COPY pb_migrations /pb/pb_migrations

EXPOSE 8090
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--hooksDir=/pb/pb_hooks", "--migrationsDir=/pb/pb_migrations"]
