# --- 빌드 스테이지 ---
FROM gradle:8.5-jdk17 AS build
WORKDIR /home/gradle/project
# 프로젝트 전체를 컨테이너에 복사 (적절히 .dockerignore 설정 필요)
COPY --chown=gradle:gradle . .
# Gradle로 빌드 (--no-daemon 옵션 추가로 CI/CD 환경 및 Docker에서 안정적으로 빌드)
RUN gradle clean build --no-daemon

# --- 런타임 스테이지 ---
FROM openjdk:17-jdk-slim
# 빌드 스테이지에서 생성된 JAR 파일 복사 
# JAR 파일명이 "yourapp.jar"라고 가정 (build/libs/yourapp.jar)
COPY --from=build /home/gradle/project/build/libs/hsb-bo-0.0.1-SNAPSHOT.jar /app/hsb-bo-0.0.1-SNAPSHOT.jar
# 컨테이너의 8080 포트를 외부에 노출
EXPOSE 8080
# 애플리케이션 실행 (필요시 JVM 옵션 등 추가 가능)
ENTRYPOINT ["java", "-jar", "/app/hsb-bo-0.0.1-SNAPSHOT.jar"]
