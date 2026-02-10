// service/FileStorageService.java
package com.romen.inventory.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Value("${app.allowed-file-types}")
    private String[] allowedFileTypes;

    @Value("${app.max-file-size-mb}")
    private long maxFileSizeMb;

    public String storeFile(MultipartFile file, String subDirectory) throws IOException {
        // Validate file
        validateFile(file);

        // Create directory if not exists
        Path uploadPath = Paths.get(uploadDir, subDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path
        return subDirectory + "/" + uniqueFilename;
    }

    public byte[] getFile(String filePath) throws IOException {
        Path fullPath = Paths.get(uploadDir, filePath);
        if (!Files.exists(fullPath)) {
            throw new IOException("File not found: " + filePath);
        }
        return Files.readAllBytes(fullPath);
    }

    public void deleteFile(String filePath) {
        try {
            Path fullPath = Paths.get(uploadDir, filePath);
            if (Files.exists(fullPath)) {
                Files.delete(fullPath);
                log.info("File deleted: {}", filePath);
            }
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filePath, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check file size
        long fileSizeMb = file.getSize() / (1024 * 1024);
        if (fileSizeMb > maxFileSizeMb) {
            throw new IllegalArgumentException("File size exceeds " + maxFileSizeMb + " MB");
        }

        // Check file type
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename).toLowerCase();

        boolean isValidType = false;
        for (String allowedType : allowedFileTypes) {
            if (("." + allowedType).equals(fileExtension)) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: " +
                    String.join(", ", allowedFileTypes));
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}