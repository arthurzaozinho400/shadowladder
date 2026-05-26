# 🎯 Sistema de Tiers, Pontos e Leaderboards

## Seções

### Top Ranqueado
Sistema competitivo com ganho e perda de pontos. Resultados aprovados por testers.
- Vitória = +pontos
- Derrota = -pontos
- Sobe de tier automaticamente ao atingir o mínimo
- Desce de tier se cair abaixo do mínimo
- Leaderboard por tier

#### Matchmaking (Ranqueado)
- Cai apenas contra jogadores do **mesmo tier**
- Quando faltam **15 pontos** para o próximo tier, o matchmaking passa a incluir também jogadores do **tier acima** (preparação para a promoção)

### Top Global
Sistema de exibição onde pontos só sobem. Sem progressão de tier.
- Vitória = +pontos
- Derrota = 0
- Não tem subida/descida de tier
- Apenas exibe o tier e os pontos acumulados
- Leaderboard por tier

---

## Modos (8)

Cada seção possui todos os modos abaixo, com sistema de pontos e tiers independentes:

1. **Crystal**
2. **UHC**
3. **Nether Pot**
4. **Pot**
5. **Sword**
6. **Axe**
7. **Mace**
8. **SMP**

---

## Tiers (pior → melhor)

Cada modo em cada seção possui 10 tiers:

```
LT5 → HT5 → LT4 → HT4 → LT3 → HT3 → LT2 → HT2 → LT1 → HT1
```

### Pontos necessários para subir (Ranqueado)

| Subida | Pontos |
|--------|--------|
| 0 → LT5 | 10 |
| LT5 → HT5 | 50 |
| HT5 → LT4 | 150 |
| LT4 → HT4 | 200 |
| HT4 → LT3 | 300 |
| LT3 → HT3 | 350 |
| HT3 → LT2 | 450 |
| LT2 → HT2 | 500 |
| HT2 → LT1 | 600 |
| LT1 → HT1 | 650 |

### Regra do bônus (Global)

- **Bônus x2 pontos** ao enfrentar alguém de tier acima

---

## Filas

- **Random**: aleatório, matchmaking entre jogadores
- **X1**: desafio direto entre dois jogadores

---

## Resumo da Estrutura

```
TOP RANQUEADO
├── Crystal (LT5 → HT1)
├── UHC (LT5 → HT1)
├── Nether Pot (LT5 → HT1)
├── Pot (LT5 → HT1)
├── Sword (LT5 → HT1)
├── Axe (LT5 → HT1)
├── Mace (LT5 → HT1)
└── SMP (LT5 → HT1)

TOP GLOBAL
├── Crystal (LT5 → HT1)
├── UHC (LT5 → HT1)
├── Nether Pot (LT5 → HT1)
├── Pot (LT5 → HT1)
├── Sword (LT5 → HT1)
├── Axe (LT5 → HT1)
├── Mace (LT5 → HT1)
└── SMP (LT5 → HT1)
```

**Total: 16 combinações, cada uma com 10 tiers, lideranças e sistema de pontos próprios.**
