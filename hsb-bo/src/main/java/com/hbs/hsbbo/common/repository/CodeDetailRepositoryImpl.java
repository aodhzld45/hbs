package com.hbs.hsbbo.common.repository;

import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CodeDetailRepositoryImpl implements CodeDetailRepository {

    private final EntityManager em;
    @Override
    public List<CodeDetailResponse> findParentCodes(String codeGroupId) {
        String sql = """
            SELECT
                code_id,
                code_name_ko,
                code_name_en,
                parent_code_id,
                order_seq
            FROM code_detail
            WHERE code_group_id = :groupId
              AND parent_code_id IS NULL
              AND use_tf = 'Y'
              AND del_tf = 'N'
            ORDER BY order_seq
        """;

        List<Object[]> resultList = em.createNativeQuery(sql)
                .setParameter("groupId", codeGroupId)
                .getResultList();

        return resultList.stream()
                .map(this::mapToCodeDetailResponse)
                .toList();
    }

    @Override
    public List<CodeDetailResponse> findChildCodes(String codeGroupId, String parentCodeId) {
        String sql = """
            SELECT
                code_id,
                code_name_ko,
                code_name_en,
                parent_code_id,
                order_seq
            FROM code_detail
            WHERE code_group_id = :groupId
              AND parent_code_id = :parentCodeId
              AND use_tf = 'Y'
              AND del_tf = 'N'
            ORDER BY order_seq
        """;

        List<Object[]> resultList = em.createNativeQuery(sql)
                .setParameter("groupId", codeGroupId)
                .setParameter("parentCodeId", parentCodeId)
                .getResultList();

        return resultList.stream()
                .map(this::mapToCodeDetailResponse)
                .toList();
    }

    private CodeDetailResponse mapToCodeDetailResponse(Object[] row) {
        return CodeDetailResponse.nativeFrom(row);
    }

}
