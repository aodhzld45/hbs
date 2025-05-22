package com.hbs.hsbbo.admin.domain.type;


// 게시판 타입 - NOTICE(공지사항), EVENT(이벤트), FAQ(자주묻는질문 - 예시)
public enum BoardType {
    NOTICE("공지사항"),
    EVENT("이벤트"),
    FAQ("FAQ 자주 묻는 질문");

    private final String displayName;

    BoardType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static BoardType from(String value) {
        return BoardType.valueOf(value.toUpperCase());
    }
}

