package com.hbs.hsbbo.common.util;

import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
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

    private final String bucketName = "my-hsb-uploads"; // 버킷 이름

    @PostConstruct
    public void init() {
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }

    /**
     * FileType, ContentType에 따라 자동 폴더 분류 후 S3 업로드
     */
    public String uploadFileToS3(FileType fileType, ContentType contentType, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        try {
            String folder = resolveS3Folder(fileType, contentType);

            String originalFilename = file.getOriginalFilename();
            String extension = getExtension(originalFilename);
            String uuidFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

            String key = folder + "/" + uuidFileName;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    //.acl("public-read")
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

    /**
     * S3 저장 폴더 결정
     */
    public String resolveS3Folder(FileType fileType, ContentType contentType) {
        return switch (fileType) {
            case VIDEO -> (contentType == ContentType.HBS) ? "video/hbs" : "video/etc";
            case IMAGE -> "image";
            case DOCUMENT -> "document/" + contentType.name().toLowerCase();
            case LINK -> throw new IllegalArgumentException("LINK 타입은 파일 저장 대상이 아닙니다.");
        };
    }

    public String getExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex != -1) ? filename.substring(dotIndex + 1) : "";
    }
}
