package com.hbs.hsbbo.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockIpRequest {

    @NotBlank(message = "ipAddress is required.")
    @Size(max = 45, message = "ipAddress max length is 45.")
    private String ipAddress;

    @Size(max = 255, message = "description max length is 255.")
    private String description;
}
