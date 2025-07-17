package com.hbs.hsbbo.admin.dto.request.page;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class PageRequest {
    @NotBlank
    private String name;
    private String url;
    private String useTf;

}
