#!/bin/sh
until /usr/bin/mc alias set minio http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
  echo "Waiting for MinIO..."
  sleep 3
done

if /usr/bin/mc ls minio/"$MINIO_BUCKET_NAME"; then
  echo "Bucket $MINIO_BUCKET_NAME already exists."
else
  /usr/bin/mc mb minio/"$MINIO_BUCKET_NAME"
fi

/usr/bin/mc anonymous set public minio/"$MINIO_BUCKET_NAME"