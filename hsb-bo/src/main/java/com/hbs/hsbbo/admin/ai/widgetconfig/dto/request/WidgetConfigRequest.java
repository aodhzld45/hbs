package com.hbs.hsbbo.admin.ai.widgetconfig.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WidgetConfigRequest {
    // 식별/이름
    @NotBlank
    private String name;

    // 위젯 생성과 동시에 연결할 SiteKey ID
    private Long linkedSiteKeyId;

    // 문구/라벨
    private String panelTitle;
    private String welcomeText;
    private String inputPlaceholder;
    private String sendButtonLabel;
    private String language;

    // 배치/크기/계층
    @NotNull
    private Position position = Position.right;
    @NotNull
    private Integer offsetX = 20;
    @NotNull
    private Integer offsetY = 20;
    @NotNull
    private Integer panelWidthPx = 360;
    private Integer panelMaxHeightPx;
    @NotNull
    private Integer zIndex = 2_147_483_000;

    public enum Position { right, left }

    // 색상/테마
    private String bubbleBgColor;
    private String bubbleFgColor;
    private String panelBgColor;
    private String panelTextColor;
    private String headerBgColor;
    private String headerBorderColor;
    private String inputBgColor;
    private String inputTextColor;
    private String primaryColor;

    // 아이콘/로고
    private String bubbleIconEmoji;
    private String bubbleIconUrl;
    private String logoUrl;

    // 동작 옵션
    @Pattern(regexp = "Y|N")
    private String openOnLoad = "N";
    private Integer openDelayMs;
    @Pattern(regexp = "Y|N")
    private String greetOncePerOpen = "Y";
    @Pattern(regexp = "Y|N")
    private String closeOnEsc = "Y";
    @Pattern(regexp = "Y|N")
    private String closeOnOutsideClick = "Y";

    // 확장 옵션(JSON)
    private Map<String, Object> options;

    // 운영 메모
    private String notes;
}
