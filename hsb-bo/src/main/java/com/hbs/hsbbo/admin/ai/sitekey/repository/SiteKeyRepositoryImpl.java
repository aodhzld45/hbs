package com.hbs.hsbbo.admin.ai.sitekey.repository;

import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.domain.type.Status;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyQuery;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Repository
public class SiteKeyRepositoryImpl implements SiteKeyRepositoryCustom{
    private final EntityManager em;

    public SiteKeyRepositoryImpl(EntityManager em) {
        this.em = em;
    }

    @Override
    public Page<SiteKey> search(SiteKeyQuery query) {
        CriteriaBuilder cb = em.getCriteriaBuilder();

        // --- select ---
        CriteriaQuery<SiteKey> cq = cb.createQuery(SiteKey.class);
        Root<SiteKey> root = cq.from(SiteKey.class);

        List<Predicate> predicates = new ArrayList<>();

        // keyword: siteKey / notes 부분 일치
        if (StringUtils.hasText(query.getKeyword())) {
            String kw = "%" + query.getKeyword().trim() + "%";
            predicates.add(cb.or(
                    cb.like(root.get("siteKey"), kw),
                    cb.like(root.get("notes"), kw)
            ));
        }

        // planCode: 정확 일치
        if (StringUtils.hasText(query.getPlanCode())) {
            predicates.add(cb.equal(root.get("planCode"), query.getPlanCode().trim()));
        }

        // status: enum 매핑
        if (StringUtils.hasText(query.getStatus())) {
            Status st = Status.parseOrDefault(query.getStatus(), null);
            if (st != null) predicates.add(cb.equal(root.get("status"), st));
        }

        cq.where(predicates.toArray(new Predicate[0]));

        // --- sort ---
        Sort sort = resolveSort(query.getSort()); // "regDate,desc" 형태
        List<Order> orders = new ArrayList<>();
        sort.forEach(order -> {
            Path<?> path = root.get(order.getProperty());
            orders.add(order.isAscending() ? cb.asc(path) : cb.desc(path));
        });
        if (!orders.isEmpty()) cq.orderBy(orders);

        // --- paging ---
        int page = query.getPage() == null ? 0 : query.getPage();
        int size = query.getSize() == null ? 20 : query.getSize();
        TypedQuery<SiteKey> select = em.createQuery(cq)
                .setFirstResult(page * size)
                .setMaxResults(size);
        List<SiteKey> content = select.getResultList();

        // --- count ---
        CriteriaQuery<Long> countQ = cb.createQuery(Long.class);
        Root<SiteKey> countRoot = countQ.from(SiteKey.class);
        countQ.select(cb.count(countRoot)).where(predicates.toArray(new Predicate[0]));
        Long total = em.createQuery(countQ).getSingleResult();

        Pageable pageable = PageRequest.of(page, size, sort);
        return new PageImpl<>(content, pageable, total);
    }

    private Sort resolveSort(String sort) {
        if (!StringUtils.hasText(sort)) return Sort.by(Sort.Order.desc("regDate"));
        // 다중정렬 "planCode,asc;regDate,desc" 같은 패턴도 처리 가능
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
}
