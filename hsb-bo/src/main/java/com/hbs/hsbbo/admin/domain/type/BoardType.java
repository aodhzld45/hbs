package com.hbs.hsbbo.admin.domain.type;


// 게시판 타입 - NOTICE(공지사항), EVENT(이벤트), FAQ(자주묻는질문 - 예시)
public enum BoardType {
    NOTICE, EVENT, FAQ;

    public static BoardType from(String value){
        return BoardType.valueOf(value.toUpperCase());
    }
}
