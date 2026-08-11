package com.autowash.autowash_pro.repository;

import com.autowash.autowash_pro.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {
}
