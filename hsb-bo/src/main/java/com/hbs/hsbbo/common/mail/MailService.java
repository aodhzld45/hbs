package com.hbs.hsbbo.common.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /**
     * 공통 메일 전송 메서드
     * @param to 받는 사람 이메일
     * @param subject 메일 제목
     * @param templateName 템플릿 경로 (ex. "email/contact-reply")
     * @param variables 템플릿에 전달할 변수들
     */

     public void sendTemplateMail(String to, String subject, String templateName, Map<String,Object> variables) {
         Context context = new Context();
         context.setVariables(variables);

         String html = templateEngine.process(templateName,context);

         try {
             MimeMessage message = mailSender.createMimeMessage();
             MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
             helper.setTo(to);
             helper.setSubject(subject);
             helper.setText(html, true); // HTML 모드

             mailSender.send(message);
         } catch (MessagingException e) {
             throw new RuntimeException("이메일 전송 실패", e);
         }


     }

}
