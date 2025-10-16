package com.hbs.hsbbo.admin.ai.sitekey.repository;

import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.domain.type.Status;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyQuery;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class SiteKeyRepositoryImpl implements SiteKeyRepositoryCustom {

    private final EntityManager em;

    public SiteKeyRepositoryImpl(EntityManager em) {
        this.em = em;
    }

    @Override
    public Page<SiteKey> search(SiteKeyQuery query) {
        final CriteriaBuilder cb = em.getCriteriaBuilder();

        // =========================
        // SELECT
        // =========================
        CriteriaQuery<SiteKey> cq = cb.createQuery(SiteKey.class);
        Root<SiteKey> root = cq.from(SiteKey.class);

        // where
        List<Predicate> where = buildPredicates(cb, root, query);
        if (!where.isEmpty()) cq.where(where.toArray(new Predicate[0]));

        // sort
        Sort sort = resolveSort(query.getSort());
        List<Order> orders = buildOrders(cb, root, sort);
        if (!orders.isEmpty()) cq.orderBy(orders);

        // paging
        int page = query.getPage() == null ? 0 : query.getPage();
        int size = query.getSize() == null ? 20 : query.getSize();

        TypedQuery<SiteKey> select = em.createQuery(cq)
                .setFirstResult(page * size)
                .setMaxResults(size);
        List<SiteKey> content = select.getResultList();

        // =========================
        // COUNT  (※ 별도의 Root로 같은 조건 재생성)
        // =========================
        CriteriaQuery<Long> countQ = cb.createQuery(Long.class);
        Root<SiteKey> countRoot = countQ.from(SiteKey.class);
        List<Predicate> countWhere = buildPredicates(cb, countRoot, query);
        countQ.select(cb.count(countRoot));
        if (!countWhere.isEmpty()) countQ.where(countWhere.toArray(new Predicate[0]));
        long total = em.createQuery(countQ).getSingleResult();

        Pageable pageable = PageRequest.of(page, size, sort);
        return new PageImpl<>(content, pageable, total);
    }

    /**
     * 공통 where 절 빌더 (Root별 새로 생성)
     */
    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<SiteKey> root, SiteKeyQuery query) {
        List<Predicate> predicates = new ArrayList<>();

        // keyword: siteKey / notes 부분 일치 (대소문 무시)
        if (hasText(query.getKeyword())) {
            String kw = "%" + query.getKeyword().trim().toLowerCase() + "%";
            predicates.add(
                    cb.or(
                            cb.like(cb.lower(root.get("siteKey")), kw),
                            cb.like(cb.lower(root.get("notes")), kw)
                    )
            );
        }

        // planCode: 정확 일치
        if (hasText(query.getPlanCode())) {
            predicates.add(cb.equal(root.get("planCode"), query.getPlanCode().trim()));
        }

        // status: enum 매핑
        if (hasText(query.getStatus())) {
            Status st = Status.parseOrDefault(query.getStatus(), null);
            if (st != null) predicates.add(cb.equal(root.get("status"), st));
        }

        // includeDeleted: false면 delTf='N'
        Boolean includeDeleted = query.getIncludeDeleted();
        if (includeDeleted == null || !includeDeleted) {
            predicates.add(cb.equal(root.get("delTf"), "N"));
        } // true면 조건 미적용 (관리자 전용, 서비스에서 권한 강제)

        // use: 'Y' | 'N' | null  (null이면 필터 없음)
        if (hasText(query.getUse())) {
            predicates.add(cb.equal(root.get("useTf"), query.getUse().trim()));
        }

        return predicates;
    }

    /**
     * 정렬 화이트리스트 → Path 매핑 후 Order 생성
     */
    private List<Order> buildOrders(CriteriaBuilder cb, Root<SiteKey> root, Sort sort) {
        List<Order> orders = new ArrayList<>();
        if (sort == null) {
            orders.add(cb.desc(root.get("regDate")));
            return orders;
        }

        sort.forEach(o -> {
            Path<?> path = toSortablePath(root, o.getProperty());
            if (path != null) {
                orders.add(o.isAscending() ? cb.asc(path) : cb.desc(path));
            }
        });

        // 유효한 정렬이 하나도 없으면 기본값
        if (orders.isEmpty()) {
            orders.add(cb.desc(root.get("regDate")));
        }
        return orders;
    }

    /**
     * 정렬 허용 필드만 Path로 변환 (연관경로 없고 모두 루트 필드라고 가정)
     * 필요 시 switch에 case 추가
     */
    private Path<?> toSortablePath(Root<SiteKey> root, String prop) {
        if (!hasText(prop)) return null;
        String p = prop.trim();

        switch (p) {
            case "regDate":   return root.get("regDate");
            case "upDate":    return root.get("upDate");
            case "siteKey":   return root.get("siteKey");
            case "planCode":  return root.get("planCode");
            case "status":    return root.get("status");
            case "useTf":     return root.get("useTf");
            case "delTf":     return root.get("delTf");
            default:          return null; // 허용 외 키는 무시
        }
    }

    private Sort resolveSort(String sort) {
        if (!hasText(sort)) return Sort.by(Sort.Order.desc("regDate"));
        // 예: "planCode,asc;regDate,desc"
        String[] clauses = sort.split(";");
        List<Sort.Order> orders = new ArrayList<>();
        for (String c : clauses) {
            String[] p = c.split(",");
            String prop = p[0].trim();
            boolean asc = p.length < 2 || !"desc".equalsIgnoreCase(p[1].trim());
            orders.add(new Sort.Order(asc ? Sort.Direction.ASC : Sort.Direction.DESC, prop));
        }
        return Sort.by(orders);
    }

    private boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }
}
