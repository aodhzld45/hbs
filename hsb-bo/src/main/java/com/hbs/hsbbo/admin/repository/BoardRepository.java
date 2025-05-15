package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {
}
