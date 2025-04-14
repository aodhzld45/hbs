# --- Stage 1: Build ---
    FROM node:16-alpine AS build
    WORKDIR /app
    # package.json(및 package-lock.json 또는 yarn.lock)이 있으면 먼저 복사하여 의존성 캐싱 활용
    COPY package*.json ./
    RUN npm install
    # 소스 전체 복사
    COPY . .
    # React 앱 빌드 (build 폴더에 최적화된 정적 파일이 생성됨)
    RUN npm run build
    
    # --- Stage 2: Serve ---
    FROM nginx:stable-alpine
    # Nginx의 기본 정적 파일 경로로 빌드 결과물을 복사
    COPY --from=build /app/build /usr/share/nginx/html
    # 만약 Nginx 기본 포트인 80번을 사용하고 싶다면 EXPOSE 80
    EXPOSE 3000
    # 컨테이너 시작 시 Nginx 실행
    CMD ["nginx", "-g", "daemon off;"]
    