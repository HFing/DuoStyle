package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCodeAndActiveTrue(String code);

    @Query("""
            select voucher
            from Voucher voucher
            where voucher.active = true
              and (voucher.expiryDate is null or voucher.expiryDate > :now)
            """)
    List<Voucher> findUsableVouchers(@Param("now") LocalDateTime now);
}
