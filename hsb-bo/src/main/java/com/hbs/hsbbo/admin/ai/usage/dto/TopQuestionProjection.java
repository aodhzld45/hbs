package com.hbs.hsbbo.admin.ai.usage.dto;

/**
 * ai_usage_log 기준 "가장 많이 물어본 질문" 집계용 프로젝션
 */
public interface TopQuestionProjection {
    String getQuestion();
    Long getCnt();
}
