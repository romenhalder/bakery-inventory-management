// dto/CategoryRequest.java
package com.romen.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    private Long parentId;

    private Integer expiryDays = 3;

    private Integer displayOrder = 0;

    private Boolean isActive = true;

    private MultipartFile image;
}
