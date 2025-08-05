package com.hbs.hsbbo.admin.repository.page;

import com.hbs.hsbbo.admin.domain.entity.page.PageSectionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public interface PageSectionFileRepository extends JpaRepository<PageSectionFile, Long> {

    // 섹션 ID 리스트 중 파일이 존재하는 섹션 ID 반환
    @Query("""
        SELECT DISTINCT f.section.id
        FROM PageSectionFile f
        WHERE f.section.id IN :sectionIds AND f.delTf = 'N'
    """)
    List<Long> findSectionIdsWithFiles(@Param("sectionIds") List<Long> sectionIds);

    // sectionId -> true/false 여부를 Map 형태로 리턴
    default Map<Long, Boolean> existsBySectionIds(List<Long> sectionIds) {
        List<Long> existIds = findSectionIdsWithFiles(sectionIds);
        return sectionIds.stream()
                .collect(Collectors.toMap(id -> id, existIds::contains));
    }

    // 관리자 요청 - 추후 분리
    List<PageSectionFile> findBySectionIdInAndDelTf(List<Long> sectionIds, String delTf);

    // 사용자 요청 - 추후 분리
    List<PageSectionFile> findBySectionIdInAndDelTfAndUseTf(List<Long> sectionIds, String delTf, String useTf);

    // 특정 섹션의 전체 파일 조회
    List<PageSectionFile> findBySectionIdAndDelTf(Long sectionId, String delTf);

    // 특정 섹션 전체 삭제
    void deleteBySectionId(Long sectionId);

    // 특정 섹션 내, 특정 ID를 제외한 나머지 삭제
    void deleteBySectionIdAndIdNotIn(Long sectionId, List<Long> ids);
}


