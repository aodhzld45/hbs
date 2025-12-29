package com.hbs.hsbbo.admin.ai.kb.dto.request;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbSourceRequest {

    @NotNull
    private Long siteKeyId;

    @NotBlank
    @Size(max = 100)
    private String sourceName;

    @Size(max = 255)
    private String description;

}
