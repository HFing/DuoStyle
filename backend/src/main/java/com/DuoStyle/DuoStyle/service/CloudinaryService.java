package com.DuoStyle.DuoStyle.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadImage(MultipartFile file);
    String uploadImageFromUrl(String sourceUrl);
    String uploadSeedImageFromUrl(String sourceUrl, String publicId);
}
