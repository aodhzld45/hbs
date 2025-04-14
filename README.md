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