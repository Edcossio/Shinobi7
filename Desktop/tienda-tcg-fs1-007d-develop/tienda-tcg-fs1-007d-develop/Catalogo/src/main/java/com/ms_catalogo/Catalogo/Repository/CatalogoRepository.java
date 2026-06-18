package com.ms_catalogo.Catalogo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ms_catalogo.Catalogo.model.Catalogo;


@Repository
public interface CatalogoRepository extends JpaRepository<Catalogo, Long> {

    /**
     * Busca una carta por su nombre exacto.
     */
    Optional<Catalogo> findByNombre(String nombre);

    /**
     * Busca todas las cartas de una categoría específica.
     */
    List<Catalogo> findByCategoria(String categoria);

    /**
     * Busca cartas cuyo nombre contiene el texto especificado (búsqueda parcial, case-insensitive).
     */
    @Query("SELECT c FROM Catalogo c WHERE LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Catalogo> buscarPorNombreContiene(@Param("nombre") String nombre);

    /**
     * Busca cartas en un rango de precio.
     */
    @Query("SELECT c FROM Catalogo c WHERE c.precio >= :precioMinimo AND c.precio <= :precioMaximo ORDER BY c.precio ASC")
    List<Catalogo> buscarPorRangoPrecio(@Param("precioMinimo") Double precioMinimo, 
                                         @Param("precioMaximo") Double precioMaximo);

    /**
     * Obtiene todas las cartas ordenadas por nombre.
     */
    @Query("SELECT c FROM Catalogo c ORDER BY c.nombre ASC")
    List<Catalogo> obtenerTodasOrdenadas();

    /**
     * Cuenta el número de cartas en una categoría específica.
     */
    long countByCategoria(String categoria);

    /**
     * Verifica si existe una carta con un nombre específico.
     */
    boolean existsByNombre(String nombre);

    /**
     * Busca las cartas más caras.
     */
    @Query(value = "SELECT * FROM cartas ORDER BY precio DESC FETCH FIRST :limite ROWS ONLY", 
           nativeQuery = true)
    List<Catalogo> obtenerCartasConMayorPrecio(@Param("limite") int limite);

    /**
     * Busca cartas por categoría y dentro de un rango de precio.
     */
    @Query("SELECT c FROM Catalogo c WHERE c.categoria = :categoria AND c.precio >= :precioMinimo AND c.precio <= :precioMaximo")
    List<Catalogo> buscarPorCategoriaYRangoPrecio(@Param("categoria") String categoria,
                                                   @Param("precioMinimo") Double precioMinimo,
                                                   @Param("precioMaximo") Double precioMaximo);
}
