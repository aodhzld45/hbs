package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.UserMenu;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserMenuTreeResponse {
    private Long id;
    private String name;
    private String url;
    private List<UserMenuTreeResponse> children;

    public static UserMenuTreeResponse fromEntity(UserMenu menu) {
        return new UserMenuTreeResponse(
                menu.getId(),
                menu.getName(),
                menu.getUrl(),
                new ArrayList<>()
        );
    }
}
