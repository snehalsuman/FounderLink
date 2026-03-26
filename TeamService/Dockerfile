FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-XX:TieredStopAtLevel=1", "-Xms128m", "-Xmx512m", "-jar", "app.jar"]
