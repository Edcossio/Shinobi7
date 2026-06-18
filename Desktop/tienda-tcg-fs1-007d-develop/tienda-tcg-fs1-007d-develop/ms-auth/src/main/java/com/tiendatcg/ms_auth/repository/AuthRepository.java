package com.tiendatcg.ms_auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tiendatcg.ms_auth.model.Autenticacion;

public interface AuthRepository extends JpaRepository<Autenticacion, Long> {
    Optional<Autenticacion> findByUsername(String username);

    Optional<Autenticacion> findByIdUsuarioRef(Long idUsuarioRef);
}
