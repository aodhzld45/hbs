# 빠른 시작 

## BO
```commandline
docker build -t hbs .
```

```commandline
docker run -p 8080:8080 hbs
```

---
## FE
```commandline
docker build -t hbs-front .
```

```commandline
docker run -p 3000:80 hbs-front  
```



## 🏷️ 커밋 메시지 태그 규칙

| 태그       | 설명                                                       |
|------------|------------------------------------------------------------|
| `feat`     | 새로운 기능 추가                                            |
| `post`     | 새 글 추가                                                  |
| `fix`      | 자잘한 수정 (버그 아님)                                     |
| `bugfix`   | 버그 수정                                                   |
| `refactor` | 코드 리팩토링 (기능 변화 없음)                             |
| `chore`    | config, 라이브러리, 빌드 설정 등 프로덕션 코드 외 수정     |
| `rename`   | 파일명, 변수명 수정                                         |
| `docs`     | 문서 수정 (README 등)                                      |
| `comment`  | 주석 추가 또는 수정                                        |
| `remove`   | 기능 또는 파일 삭제                                        |
| `test`     | 테스트 코드 작성                                           |
| `hotfix`   | 긴급 버그 수정 (배포 후 치명적인 문제 해결 등)             |

