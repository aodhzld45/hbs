package com.hbs.hsbbo.common.config;

import com.hbs.hsbbo.common.util.FileStorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileStorageProperties fileStorageProperties;

    // CORS 설정
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://43.203.62.30:3000", "http://15.164.29.186:3000", "http://hbs-test1-1841060588.ap-northeast-2.elb.amazonaws.com:3000", "http://localhost:3000", "http://192.168.0.90:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .exposedHeaders("Content-Disposition")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // 로컬
    // @Override
    // public void addCorsMappings(CorsRegistry registry) {
    //     registry.addMapping("/api/**")
    //             .allowedOrigins("http://localhost:3000")
    //             .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    //             .allowedHeaders("*")
    //             .allowCredentials(true);
    // }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:" + fileStorageProperties.getUploadPath() + "/")
                .setCachePeriod(3600);
    }

}
