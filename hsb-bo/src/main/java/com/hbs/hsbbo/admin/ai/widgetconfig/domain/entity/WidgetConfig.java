package com.hbs.hsbbo.admin.ai.widgetconfig.domain.entity;

import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "ai_widget_config",
        indexes = {
                @Index(name = "idx_name",     columnList = "name"),
                @Index(name = "idx_reg_date", columnList = "reg_date"),
                @Index(name = "idx_use_tf",   columnList = "use_tf")
        }
)
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WidgetConfig extends AuditBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 식별/이름
    @Column(name = "name", length = 80, nullable = false)
    private String name;

    // 문구/라벨
    @Column(name = "panel_title", length = 100)
    private String panelTitle;

    @Column(name = "welcome_text", length = 255)
    private String welcomeText;

    @Column(name = "input_placeholder", length = 100)
    private String inputPlaceholder;

    @Column(name = "send_button_label", length = 30)
    private String sendButtonLabel;

    @Column(name = "language", length = 10)
    private String language;

    // 배치/크기/계층
    public enum Position { right, left }

    @Enumerated(EnumType.STRING)
    @Column(name = "position", length = 5, nullable = false)
    private Position position = Position.right;

    @Column(name = "offset_x", nullable = false)
    private Integer offsetX = 20;

    @Column(name = "offset_y", nullable = false)
    private Integer offsetY = 20;

    @Column(name = "panel_width_px", nullable = false)
    private Integer panelWidthPx = 360;

    @Column(name = "panel_max_height_px")
    private Integer panelMaxHeightPx;

    @Column(name = "z_index", nullable = false)
    private Integer zIndex = 2_147_483_000;

    // 색상/테마
    @Column(name = "bubble_bg_color", length = 20)
    private String bubbleBgColor;

    @Column(name = "bubble_fg_color", length = 20)
    private String bubbleFgColor;

    @Column(name = "panel_bg_color", length = 20)
    private String panelBgColor;

    @Column(name = "panel_text_color", length = 20)
    private String panelTextColor;

    @Column(name = "header_bg_color", length = 20)
    private String headerBgColor;

    @Column(name = "header_border_color", length = 20)
    private String headerBorderColor;

    @Column(name = "input_bg_color", length = 20)
    private String inputBgColor;

    @Column(name = "input_text_color", length = 20)
    private String inputTextColor;

    @Column(name = "primary_color", length = 20)
    private String primaryColor;

    // 아이콘/로고
    @Column(name = "bubble_icon_emoji", length = 8)
    private String bubbleIconEmoji;

    @Column(name = "bubble_icon_url", length = 255)
    private String bubbleIconUrl;

    @Column(name = "logo_url", length = 255)
    private String logoUrl;

    // 동작 옵션
    @Column(name = "open_on_load", length = 1, nullable = false)
    private String openOnLoad = "N";

    @Column(name = "open_delay_ms")
    private Integer openDelayMs;

    @Column(name = "greet_once_per_open", length = 1, nullable = false)
    private String greetOncePerOpen = "Y";

    @Column(name = "close_on_esc", length = 1, nullable = false)
    private String closeOnEsc = "Y";

    @Column(name = "close_on_outside_click", length = 1, nullable = false)
    private String closeOnOutsideClick = "Y";

    // 확장 옵션(JSON)
    @Column(name = "options_json", columnDefinition = "json")
    private String optionsJson;

    // 운영 메모
    @Column(name = "notes", length = 255)
    private String notes;

}
