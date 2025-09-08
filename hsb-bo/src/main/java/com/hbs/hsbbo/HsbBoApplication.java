package com.hbs.hsbbo;

import com.hbs.hsbbo.common.util.FileStorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling   // 스케줄링 활성화
@SpringBootApplication
@EnableConfigurationProperties(FileStorageProperties.class)
public class HsbBoApplication {

	public static void main(String[] args) {
		SpringApplication.run(HsbBoApplication.class, args);
	}

}
