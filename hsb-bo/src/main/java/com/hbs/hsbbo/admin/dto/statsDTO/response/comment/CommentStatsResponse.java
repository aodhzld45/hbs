package com.hbs.hsbbo.admin.dto.statsDTO.response.comment;

import java.util.List;

public record CommentStatsResponse (
        List<CommentTargetResponse> commentTarget
) {}
