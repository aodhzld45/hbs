package com.hbs.hsbbo.common.repository;

import com.hbs.hsbbo.common.domain.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}
