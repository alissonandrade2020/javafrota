package br.com.portfolio.frota.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class)
 ResponseEntity<Map<String,String>> invalid(MethodArgumentNotValidException ex){
   String msg=ex.getBindingResult().getFieldErrors().stream().findFirst().map(e->e.getDefaultMessage()).orElse("Dados inválidos");
   return ResponseEntity.badRequest().body(Map.of("erro",msg));
 }
 @ExceptionHandler(ResponseStatusException.class)
 ResponseEntity<Map<String,String>> status(ResponseStatusException ex){
   return ResponseEntity.status(ex.getStatusCode()).body(Map.of("erro",ex.getReason()==null?"Erro na requisição":ex.getReason()));
 }
}
