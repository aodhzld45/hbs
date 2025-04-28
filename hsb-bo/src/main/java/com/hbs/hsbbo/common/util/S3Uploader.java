package com.hbs.hsbbo.common.util;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@RequiredArgsConstructor
@Component
public class S3Uploader {
    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    private S3Client s3Client;

    private final String bucketName = "my-hsb-uploads"; // 사용 중인 버킷 이름

    @PostConstruct
    public void init() {
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }


    /*
     * S3 파일 업로드
     */

    public String uploadFile(String folder, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getExtension(originalFilename);
            String uuidFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

            String key = folder + "/" + uuidFileName; // 폴더 + 파일명

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .acl("public-read") // 퍼블릭 읽기 설정
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromInputStream(
                    file.getInputStream(), file.getSize()
            ));

            return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;
        } catch (IOException e) {
            throw new RuntimeException("S3 파일 업로드 실패", e);
        }
    }

    // 확장자 얻어오는 메서드.
    private String getExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex != -1) ? filename.substring(dotIndex + 1) : "";
    }
    
}





