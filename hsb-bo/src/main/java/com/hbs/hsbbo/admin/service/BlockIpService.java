package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.AppBlockIp;
import com.hbs.hsbbo.admin.dto.request.BlockIpRequest;
import com.hbs.hsbbo.admin.dto.response.BlockIpListResponse;
import com.hbs.hsbbo.admin.dto.response.BlockIpResponse;
import com.hbs.hsbbo.admin.repository.BlockIpRepository;
import com.hbs.hsbbo.common.ip.BlockedIpProvider;
import com.hbs.hsbbo.common.util.ClientIpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BlockIpService implements BlockedIpProvider {

    private final BlockIpRepository blockIpRepository;

    @Transactional(readOnly = true)
    public List<AppBlockIp> findAllActive() {
        return blockIpRepository.findAllActive();
    }

    @Transactional(readOnly = true)
    public BlockIpResponse findActiveById(Long id) {
        AppBlockIp entity = blockIpRepository.findById(id)
                .filter(e -> "Y".equalsIgnoreCase(e.getUseTf()) && "N".equalsIgnoreCase(e.getDelTf()))
                .orElseThrow(() -> new IllegalArgumentException("Active BlockIP not found. id=" + id));
        return BlockIpResponse.from(entity);
    }

    @Transactional(readOnly = true)
    public BlockIpListResponse list(String keyword, int page, int size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<AppBlockIp> result = blockIpRepository.search(keyword, pageable);

        List<BlockIpResponse> items = result.getContent().stream()
                .map(BlockIpResponse::from)
                .toList();

        return BlockIpListResponse.of(items, result.getTotalElements(), result.getTotalPages());
    }

    public Long create(BlockIpRequest req, String actor) {
        String ipAddress = normalizeRequiredIp(req.getIpAddress());
        String normalizedActor = normalizeActor(actor);

        AppBlockIp existing = blockIpRepository.findByIpAddress(ipAddress).orElse(null);
        if (existing != null) {
            if ("Y".equalsIgnoreCase(existing.getDelTf())) {
                existing.setDelTf("N");
                existing.setDelAdm(null);
                existing.setDelDate(null);
                existing.setUseTf("Y");
                existing.setDescription(normalize(req.getDescription()));
                existing.setUpAdm(normalizedActor);
                existing.setUpDate(LocalDateTime.now());
                return existing.getId();
            }
            throw new IllegalArgumentException("BlockIP already exists. ipAddress=" + ipAddress);
        }

        AppBlockIp entity = new AppBlockIp();
        entity.setIpAddress(ipAddress);
        entity.setDescription(normalize(req.getDescription()));
        entity.setUseTf("Y");
        entity.setDelTf("N");
        entity.setRegAdm(normalizedActor);
        entity.setRegDate(LocalDateTime.now());
        entity.setUpAdm(normalizedActor);
        entity.setUpDate(LocalDateTime.now());

        blockIpRepository.save(entity);
        return entity.getId();
    }

    public Long update(Long id, BlockIpRequest req, String actor) {
        AppBlockIp entity = blockIpRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("BlockIP not found. id=" + id));

        if (req.getIpAddress() != null && !req.getIpAddress().isBlank()) {
            String normalizedIp = normalizeRequiredIp(req.getIpAddress());
            if (!normalizedIp.equals(entity.getIpAddress())) {
                AppBlockIp duplicate = blockIpRepository.findByIpAddress(normalizedIp).orElse(null);
                if (duplicate != null && !duplicate.getId().equals(id)) {
                    throw new IllegalArgumentException("BlockIP already exists. ipAddress=" + normalizedIp);
                }
                entity.setIpAddress(normalizedIp);
            }
        }

        if (req.getDescription() != null) {
            entity.setDescription(normalize(req.getDescription()));
        }

        entity.setUpAdm(normalizeActor(actor));
        entity.setUpDate(LocalDateTime.now());
        return entity.getId();
    }

    public Long updateUseTf(Long id, String newUseTf, String actor) {
        AppBlockIp entity = blockIpRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("BlockIP not found. id=" + id));

        entity.setUseTf(normalizeFlag(newUseTf));
        entity.setUpAdm(normalizeActor(actor));
        entity.setUpDate(LocalDateTime.now());
        return blockIpRepository.save(entity).getId();
    }

    public Long deleteBlockIp(Long id, String actor) {
        AppBlockIp entity = blockIpRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("BlockIP not found. id=" + id));
        String normalizedActor = normalizeActor(actor);

        entity.setDelTf("Y");
        entity.setDelAdm(normalizedActor);
        entity.setDelDate(LocalDateTime.now());
        entity.setUpAdm(normalizedActor);
        entity.setUpDate(LocalDateTime.now());
        return blockIpRepository.save(entity).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBlocked(String ipAddress) {
        String normalizedIp = ClientIpUtil.normalizeIp(ipAddress);
        if (normalizedIp == null) {
            return false;
        }
        return blockIpRepository.existsActiveByIpAddress(normalizedIp);
    }

    private String normalizeRequiredIp(String ipAddress) {
        String normalized = ClientIpUtil.normalizeIp(ipAddress);
        if (normalized == null) {
            throw new IllegalArgumentException("Invalid IP address format.");
        }
        return normalized;
    }

    private static String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String normalizeActor(String actor) {
        String normalized = normalize(actor);
        return normalized == null ? "system" : normalized;
    }

    private static String normalizeFlag(String flag) {
        String normalized = normalize(flag);
        if (normalized == null) {
            throw new IllegalArgumentException("newUseTf is required.");
        }
        String upper = normalized.toUpperCase();
        if (!"Y".equals(upper) && !"N".equals(upper)) {
            throw new IllegalArgumentException("newUseTf must be Y or N.");
        }
        return upper;
    }

    private Pageable buildPageable(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) {
            return PageRequest.of(page, size, Sort.by(Sort.Order.desc("regDate")));
        }

        String[] parts = sort.split(",");
        if (parts.length == 2) {
            return PageRequest.of(
                    page,
                    size,
                    Sort.by(Sort.Direction.fromString(parts[1].trim()), parts[0].trim())
            );
        }
        return PageRequest.of(page, size, Sort.by(Sort.Order.desc("regDate")));
    }
}
