package com.hbs.hsbbo.common.repository;

import com.hbs.hsbbo.common.dto.response.CodeGroupResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CodeGroupRepositoryImpl implements CodeGroupRepository {

    private final EntityManager em;

    @Override
    public List<CodeGroupResponse> findAllGroups() {
        String sql = """
            SELECT
                id,
                code_group_id,
                group_name,
                description,
                order_seq,
                use_tf
            FROM code_group
            WHERE 1=1
              AND del_tf = 'N'
            ORDER BY order_seq
        """;

        List<Object[]> resultList = em.createNativeQuery(sql)
                .getResultList();

        return resultList.stream()
                .map(this::mapToCodeGroupResponse)
                .toList();
    }

    private CodeGroupResponse mapToCodeGroupResponse(Object[] row) {
        return CodeGroupResponse.nativeFrom(row);
    }
}
