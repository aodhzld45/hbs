package com.hbs.hsbbo.common.repository;

import com.hbs.hsbbo.common.dto.response.CodeGroupResponse;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeGroupRepository {
    List<CodeGroupResponse> findAllGroups();

}