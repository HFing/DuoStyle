package com.DuoStyle.DuoStyle.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "duostyle_products"));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new CustomException(500, "Failed to upload image to Cloudinary: " + e.getMessage());
        }
    }

    @Override
    public String uploadImageFromUrl(String sourceUrl) {
        if (sourceUrl == null || sourceUrl.isBlank()) {
            return sourceUrl;
        }
        try {
            log.info("Uploading image URL to Cloudinary: {}", sourceUrl);
            Map uploadResult = cloudinary.uploader().upload(sourceUrl, ObjectUtils.asMap("folder", "duostyle_products"));
            String secureUrl = uploadResult.get("secure_url").toString();
            log.info("Uploaded successfully -> {}", secureUrl);
            return secureUrl;
        } catch (Exception e) {
            log.warn("Cloudinary upload from URL failed for {}: {}. Using original URL.", sourceUrl, e.getMessage());
            return sourceUrl;
        }
    }

    @Override
    public String uploadSeedImageFromUrl(String sourceUrl, String publicId) {
        if (sourceUrl == null || sourceUrl.isBlank() || publicId == null || publicId.isBlank()) {
            throw new CustomException(400, "Seed image source URL and public ID are required");
        }
        try {
            Map uploadResult = cloudinary.uploader().upload(sourceUrl, ObjectUtils.asMap(
                    "folder", "duostyle_products/coolmate_seed",
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "image"));
            Object secureUrlValue = uploadResult.get("secure_url");
            String secureUrl = secureUrlValue == null ? null : secureUrlValue.toString();
            if (secureUrl == null || !secureUrl.startsWith("https://")) {
                throw new IllegalStateException("Cloudinary response is missing a secure HTTPS URL");
            }
            return secureUrl;
        } catch (Exception exception) {
            throw new CustomException(500,
                    "Failed to upload seed image " + publicId + " from " + sourceUrl + ": " + exception.getMessage());
        }
    }
}
