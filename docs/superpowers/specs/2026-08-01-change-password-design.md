# Change Password Feature Design Spec

**Date:** 2026-08-01  
**Feature:** User Profile - Change Password Modal & API  
**Status:** Approved  

---

## 1. Overview
This specification details the end-to-end design for allowing authenticated users to change their password securely via a popup modal on their Profile page (`ProfilePage.tsx`).

---

## 2. Architecture & Data Flow

```
[ProfilePage.tsx] --(Clicks "Đổi Mật Khẩu")--> [ChangePasswordModal.tsx]
                                                        |
                                                (Submits Form)
                                                        |
                                            POST /api/v1/auth/change-password
                                                        |
                                                [AuthController]
                                                        |
                                                [UserServiceImpl]
                                                        |
                                        - Validate current password (BCrypt)
                                        - Validate length & confirm match
                                        - Encode & save user entity
                                                        |
                                            <-- HTTP 200 OK + Toast Notification
```

---

## 3. Backend Requirements

### 3.1 Data Transfer Object
Create `ChangePasswordRequest.java` in `com.DuoStyle.DuoStyle.dto.request`:
- `currentPassword`: String (NotNull, NotBlank)
- `newPassword`: String (NotNull, Size min=6)
- `confirmPassword`: String (NotNull)

### 3.2 Service Layer (`UserService.java` / `UserServiceImpl.java`)
Method: `void changePassword(String email, ChangePasswordRequest request)`
Logic:
1. Fetch user by email. Throw `CustomException(404, "Không tìm thấy người dùng!")` if not found.
2. Check `passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())`. If false, throw `CustomException(400, "Mật khẩu hiện tại không chính xác.")`.
3. Check `request.getNewPassword().length() >= 6`. If false, throw `CustomException(400, "Mật khẩu mới phải từ 6 ký tự trở lên.")`.
4. Check `request.getNewPassword().equals(request.getConfirmPassword())`. If false, throw `CustomException(400, "Mật khẩu mới và xác nhận mật khẩu không khớp.")`.
5. Check `!request.getNewPassword().equals(request.getCurrentPassword())`. If false, throw `CustomException(400, "Mật khẩu mới không được trùng với mật khẩu hiện tại.")`.
6. Encode new password with `passwordEncoder.encode(request.getNewPassword())` and update `user.setPassword(...)`. Save entity.

### 3.3 Controller Layer (`AuthController.java`)
Endpoint: `POST /api/v1/auth/change-password`
Access: Authenticated users (`Authentication authentication`).
Return: `ResponseEntity<ApiResponse<Void>>` with message `"Đổi mật khẩu thành công!"`.

---

## 4. Frontend Requirements

### 4.1 Component `ChangePasswordModal.tsx`
Location: `frontend/src/components/ChangePasswordModal.tsx`
Props:
- `isOpen`: boolean
- `onClose`: () => void
- `showToast`: (message: string, type: 'success' | 'error') => void

UI Elements:
- Modern modal backdrop with glassmorphism blur (`backdrop-blur-xs`).
- Input 1: Current password with toggle visibility icon (Eye).
- Input 2: New password with toggle visibility icon.
- Input 3: Confirm new password.
- Inline validation error messages in red text.
- Buttons: "Hủy" and "Cập Nhật Mật Khẩu" (loading state disabled during request).

### 4.2 Integration in `ProfilePage.tsx`
- Add state `const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);`.
- Render button **"Đổi Mật Khẩu"** in the Account Info section of Profile page.
- Render `<ChangePasswordModal />` component.

---

## 5. Automated Unit Tests
Add test cases in `UserServiceImplTest.java`:
- `testChangePassword_Success`: Valid current password and matching new password updates password in repository.
- `testChangePassword_IncorrectCurrentPassword`: Throws 400 when current password does not match.
- `testChangePassword_PasswordMismatch`: Throws 400 when new password and confirm password differ.
