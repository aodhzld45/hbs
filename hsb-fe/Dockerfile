# --- Stage 1: Build ---
    FROM node:16-alpine AS build
    WORKDIR /app
    COPY package*.json ./
    ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
    RUN npm install
    COPY . .
    RUN npm run build \
        && cp public/.htaccess build/.htaccess
    
    

    # --- Stage 2: Serve with Apache ---
    FROM httpd:2.4-alpine
    # React의 빌드 결과물을 Apache 기본 htdocs로 복사

    RUN sed -i \
        -e 's|#LoadModule rewrite_module modules/mod_rewrite.so|LoadModule rewrite_module modules/mod_rewrite.so|' \
        -e 's|AllowOverride None|AllowOverride All|' \
        /usr/local/apache2/conf/httpd.conf

    COPY --from=build /app/build/ /usr/local/apache2/htdocs/
    # build 스테이지 이후…
    COPY --from=build /app/build/.htaccess /usr/local/apache2/htdocs/.htaccess
    

    EXPOSE 80
    CMD ["httpd-foreground"]
    