package com.hbs.hsbbo.admin.ai.widgetconfig.dto.response;

import com.hbs.hsbbo.admin.ai.widgetconfig.domain.entity.WidgetConfig;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class WidgetConfigResponse {
    private Long id;
    private String name;

    // 문구/라벨
    private String panelTitle;
    private String welcomeText;
    private String inputPlaceholder;
    private String sendButtonLabel;
    private String language;

    // 배치/크기/계층
    private String  position;          // "right" | "left"
    private Integer offsetX;
    private Integer offsetY;
    private Integer panelWidthPx;
    private Integer panelMaxHeightPx;
    private Integer zIndex;

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
    private String  openOnLoad;            // "Y" | "N"
    private Integer openDelayMs;
    private String  greetOncePerOpen;      // "Y" | "N"
    private String  closeOnEsc;            // "Y" | "N"
    private String  closeOnOutsideClick;   // "Y" | "N"

    // 확장 옵션(JSON 디코딩)
    private Map<String, Object> options;

    // 운영 메모 & 감사 필드(읽기 전용)
    private String notes;
    private String useTf;
    private String delTf;
    private LocalDateTime regDate;
    private LocalDateTime upDate;

    // 엔티티 → 응답 매핑 (options는 서비스에서 파싱하여 주입)
    public static WidgetConfigResponse from(WidgetConfig e, Map<String, Object> options) {
        return WidgetConfigResponse.builder()
                .id(e.getId())
                .name(e.getName())

                .panelTitle(e.getPanelTitle())
                .welcomeText(e.getWelcomeText())
                .inputPlaceholder(e.getInputPlaceholder())
                .sendButtonLabel(e.getSendButtonLabel())
                .language(e.getLanguage())

                .position(e.getPosition() != null ? e.getPosition().name() : null)
                .offsetX(e.getOffsetX())
                .offsetY(e.getOffsetY())
                .panelWidthPx(e.getPanelWidthPx())
                .panelMaxHeightPx(e.getPanelMaxHeightPx())
                .zIndex(e.getZIndex())

                .bubbleBgColor(e.getBubbleBgColor())
                .bubbleFgColor(e.getBubbleFgColor())
                .panelBgColor(e.getPanelBgColor())
                .panelTextColor(e.getPanelTextColor())
                .headerBgColor(e.getHeaderBgColor())
                .headerBorderColor(e.getHeaderBorderColor())
                .inputBgColor(e.getInputBgColor())
                .inputTextColor(e.getInputTextColor())
                .primaryColor(e.getPrimaryColor())

                .bubbleIconEmoji(e.getBubbleIconEmoji())
                .bubbleIconUrl(e.getBubbleIconUrl())
                .logoUrl(e.getLogoUrl())

                .openOnLoad(e.getOpenOnLoad())
                .openDelayMs(e.getOpenDelayMs())
                .greetOncePerOpen(e.getGreetOncePerOpen())
                .closeOnEsc(e.getCloseOnEsc())
                .closeOnOutsideClick(e.getCloseOnOutsideClick())

                .options(options)

                .notes(e.getNotes())
                .useTf(e.getUseTf())
                .delTf(e.getDelTf())
                .regDate(e.getRegDate())
                .upDate(e.getUpDate())
                .build();
    }
}
