package com.hbs.hsbbo;

import com.hbs.hsbbo.common.util.FileStorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(FileStorageProperties.class)
public class HsbBoApplication {

	public static void main(String[] args) {
		SpringApplication.run(HsbBoApplication.class, args);
	}

}
