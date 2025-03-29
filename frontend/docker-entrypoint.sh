#!/bin/sh

# Replace env vars in JavaScript files
for file in /usr/share/nginx/html/static/js/*.js; do
  if [ -f "$file" ]; then
    sed -i "s|%REACT_APP_API_URL%|${REACT_APP_API_URL}|g" $file
    sed -i "s|%REACT_APP_ENV%|${REACT_APP_ENV}|g" $file
  fi
done

# Process nginx config templates
DOLLAR='$' envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx
exec nginx -g "daemon off;"