# Checklist de Vulnerabilidades Web

## Objetivo

Este documento serve para:

* checar vulnerabilidades no site
* entender riscos comuns
* aplicar prevenções básicas
* melhorar a segurança geral da aplicação

---

# 1. SQL Injection (SQLi)

## O que é?

Permite inserir comandos SQL maliciosos em campos do site.

## O que checar

* Login
* Busca
* APIs
* Filtros
* URL parameters

## Exemplos

### Exemplo 1

```sql id="0j1v8h"
' OR '1'='1
```

### Exemplo 2

```sql id="jg3g2v"
admin' --
```

## Como prevenir

* Prepared Statements
* ORM
* Validação de input
* Escapar caracteres especiais

---

# 2. Cross-Site Scripting (XSS)

## O que é?

Permite executar JavaScript no navegador da vítima.

## O que checar

* Comentários
* Chat
* Perfil
* Inputs públicos

## Exemplos

### Exemplo 1

```html id="m0ybwq"
<script>alert('XSS')</script>
```

### Exemplo 2

```html id="c5m9w0"
<img src=x onerror=alert(1)>
```

## Como prevenir

* Sanitizar HTML
* Usar textContent
* Content Security Policy (CSP)
* Escapar output

---

# 3. Cross-Site Request Forgery (CSRF)

## O que é?

Faz a vítima executar ações sem perceber.

## O que checar

* Alteração de senha
* Painel admin
* Formulários autenticados

## Exemplos

### Exemplo 1

```html id="v0qk0k"
<form action="/delete-account">
```

### Exemplo 2

```html id="h6b6ru"
<img src="https://site.com/transfer?money=1000">
```

## Como prevenir

* CSRF Tokens
* SameSite Cookies
* Verificação de origem
* Reautenticação

---

# 4. Broken Authentication

## O que é?

Falhas no sistema de login.

## O que checar

* Tokens
* Sessões
* Reset de senha
* Limite de tentativas

## Exemplos

### Exemplo 1

```txt id="h6l2dy"
Senha fraca: 123456
```

### Exemplo 2

```txt id="qz9g8x"
Sessão sem expiração
```

## Como prevenir

* bcrypt/argon2
* Rate limit
* 2FA
* Expiração de sessão

---

# 5. Broken Access Control

## O que é?

Usuário acessa recursos sem permissão.

## O que checar

* /admin
* APIs privadas
* IDs sequenciais

## Exemplos

### Exemplo 1

```txt id="v9e5z1"
/admin/users
```

### Exemplo 2

```txt id="pyz26x"
/api/user/1
```

## Como prevenir

* Validar permissões no backend
* Middleware de autenticação
* ACL/RBAC

---

# 6. File Upload Vulnerability

## O que é?

Upload inseguro de arquivos.

## O que checar

* Upload de imagens
* PDFs
* Anexos

## Exemplos

### Exemplo 1

```php id="3d9k8j"
shell.php
```

### Exemplo 2

```txt id="q3r7k2"
virus.exe renomeado para imagem.png
```

## Como prevenir

* Validar MIME type
* Limitar extensões
* Renomear arquivos
* Armazenar fora da pasta pública

---

# 7. Directory Traversal

## O que é?

Acesso indevido a arquivos do servidor.

## O que checar

* Downloads
* Visualização de arquivos
* Includes

## Exemplos

### Exemplo 1

```txt id="e0o1q5"
../../../etc/passwd
```

### Exemplo 2

```txt id="i1n6r7"
..\\..\\windows\\system32
```

## Como prevenir

* Sanitizar caminhos
* Restringir diretórios
* Nunca confiar em input do usuário

---

# 8. Remote Code Execution (RCE)

## O que é?

Execução remota de código no servidor.

## O que checar

* Uploads
* Execução de comandos
* Plugins
* Painéis admin

## Exemplos

### Exemplo 1

```bash id="kr6q3r"
; whoami
```

### Exemplo 2

```bash id="4h6s2f"
&& cat /etc/passwd
```

## Como prevenir

* Nunca executar input do usuário
* Sandbox
* Desabilitar funções perigosas
* Atualizar dependências

---

# 9. SSRF (Server-Side Request Forgery)

## O que é?

Faz o servidor acessar recursos internos.

## O que checar

* Webhooks
* Importação de URLs
* APIs externas

## Exemplos

### Exemplo 1

```txt id="x6f3t8"
http://127.0.0.1
```

### Exemplo 2

```txt id="m8t2w4"
http://169.254.169.254
```

## Como prevenir

* Bloquear IPs internos
* Allowlist de domínios
* Validar URLs

---

# 10. Information Disclosure

## O que é?

Exposição de dados sensíveis.

## O que checar

* .env
* logs
* backups
* mensagens de erro

## Exemplos

### Exemplo 1

```txt id="k7u2f0"
/.env
```

### Exemplo 2

```txt id="d1j9n5"
backup.sql
```

## Como prevenir

* Desabilitar debug
* Configurar permissões
* Ocultar erros internos
* Bloquear arquivos sensíveis

---

# 11. Clickjacking

## O que é?

Enganar usuários com elementos invisíveis.

## O que checar

* Painéis
* Botões críticos
* iFrames

## Exemplos

### Exemplo 1

```html id="j0a6m2"
<iframe opacity="0">
```

### Exemplo 2

```html id="t5k8r1"
Botão invisível sobreposto
```

## Como prevenir

* X-Frame-Options
* CSP frame-ancestors
* Proteção anti-iframe

---

# 12. Dependências Vulneráveis

## O que é?

Bibliotecas antigas com falhas conhecidas.

## O que checar

* npm
* composer
* pip
* plugins

## Exemplos

### Exemplo 1

```bash id="w8z3k6"
npm audit
```

### Exemplo 2

```bash id="a6x1m9"
pip list --outdated
```

## Como prevenir

* Atualizações frequentes
* Auditorias
* Remover libs inúteis

---

# Ferramentas Recomendadas

## Scanner Web

* OWASP ZAP
* Burp Suite
* Nikto

## Headers

* [Security Headers Checker](https://securityheaders.com/?utm_source=chatgpt.com)
* [Mozilla Observatory](https://observatory.mozilla.org/?utm_source=chatgpt.com)

---

# Checklist Final

* [ ] HTTPS ativo
* [ ] Rate limit funcionando
* [ ] Senhas criptografadas
* [ ] Painel admin protegido
* [ ] CSP configurado
* [ ] Upload seguro
* [ ] Sem arquivos sensíveis públicos
* [ ] Dependências atualizadas
* [ ] Logs funcionando
* [ ] Backup automático
* [ ] 2FA para admins
* [ ] Scanner semanal executado
