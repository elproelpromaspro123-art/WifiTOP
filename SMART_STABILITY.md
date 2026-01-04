# Detección Inteligente de Estabilidad

## Problema Original
La lógica simple solo decía "3 segundos sin mejora = estable".

**Problema**: Un WiFi con fluctuaciones normales se confunde:
```
[0s]  85 Mbps
[1s]  84 Mbps  ← bajó 1, ¿es caída real?
[2s]  85 Mbps  ← subió de nuevo
[3s]  86 Mbps  ← subió más
```

Con lógica simple: "Como no mejoró en 3 seg consecutivos, PARAR"
**Resultado**: Paró cuando no debería (WiFi estable a 85-86)

---

## Solución: Detección Inteligente

### Tres Factores que Valida:

#### 1️⃣ Promedio móvil en rango
```
Últimas 5 mediciones: 85, 84, 85, 86, 85
Promedio: 85 Mbps

Máximo alcanzado: 90 Mbps
Threshold 97%: 90 × 0.97 = 87.3 Mbps

¿Promedio (85) >= Threshold (87.3)? SÍ → En rango ✓
```

#### 2️⃣ No hay caída consistente
```
Últimas mediciones: 90, 89, 88, 87, 86, 85
Caída consecutiva: 90→89→88→87→86→85 = 6 mediciones bajando

¿Hay 4+ bajando consecutivas? SÍ → Caída detectada ✗
```

#### 3️⃣ Lógica Final
```
Estabilizado = (En rango) Y (SIN caída consistente)
             = (SÍ) Y (NO)
             = SÍ → PARAR ✓
```

---

## Ejemplos Reales

### Caso 1: WiFi Normal (fluctuaciones pequeñas)
```
Mediciones: 85, 84, 85, 86, 85, 84, 85
             └─ -1  +1  +1  -1  -1  +1

Promedio últimas 5: 85 Mbps
Máximo: 86, Threshold: 83.4
¿Promedio >= Threshold? SÍ ✓

¿Caída consecutiva?
85 < 84? NO → Counter se reinicia
Caída detectada: 0 (no hay)

Resultado: ✓ ESTABILIZADO (NO parar aquí)
```

### Caso 2: Caída Real
```
Mediciones: 85, 84, 83, 82, 81, 80
             └─ -1  -1  -1  -1  -1

Promedio últimas 5: 82.4 Mbps
Máximo: 85, Threshold: 82.45
¿Promedio >= Threshold? NO ✗

¿Caída consecutiva?
80 < 81? SÍ
81 < 82? SÍ
82 < 83? SÍ
83 < 84? SÍ → 4 caídas consecutivas

Resultado: ✓ DETECTÓ CAÍDA REAL (PARAR aquí)
```

### Caso 3: Fluctuación + Recuperación
```
Mediciones: 90, 85, 83, 84, 86, 88, 89
             └─ -5  -2  +1  +2  +2  +1

Promedio últimas 5: 86 Mbps
Máximo: 90, Threshold: 87.3
¿Promedio >= Threshold? SÍ ✓

¿Caída consecutiva?
89 < 88? NO → Counter se reinicia
Caída detectada: 0 (se recuperó)

Resultado: ✓ ESTABILIZADO (recuperación detectada)
```

---

## Con 500 Mbps Real

```
[0s]   450 Mbps (acelerando)
[1s]   480 Mbps 
[2s]   505 Mbps (máximo alcanzado)
[3s]   504 Mbps ← Normal, fluctuación
[4s]   503 Mbps ← Normal, fluctuación
[5s]   505 Mbps ← Recuperó
[6s]   504 Mbps ← Fluctuación

Promedio últimas 5: 504.2 Mbps
Máximo: 505, Threshold: 489.85
¿Promedio >= Threshold? SÍ ✓

¿Caída consistente?
504 < 505? SÍ (1)
503 < 504? SÍ (2)
504 > 503? NO → Recuperó, reinicia
Caída detectada: 0

Resultado: ✓ ESTABILIZADO (NO parar, es normal)
```

---

## Con Caída Real (problema de WiFi)

```
[0s]   450 Mbps
[1s]   480 Mbps
[2s]   505 Mbps (máximo)
[3s]   500 Mbps (empieza a bajar)
[4s]   495 Mbps ← Baja
[5s]   485 Mbps ← Baja
[6s]   475 Mbps ← Baja

Promedio últimas 5: 490 Mbps
Máximo: 505, Threshold: 489.85
¿Promedio >= Threshold? NO ✗ (490 > 489.85 apenas)

¿Caída consecutiva?
475 < 485? SÍ (1)
485 < 495? SÍ (2)
495 < 500? SÍ (3)
500 < 505? SÍ (4) ← 4 seguidas = CAÍDA REAL

Resultado: ✓ PARAR (detectó caída real del WiFi)
```

---

## Parámetros Configurables

```typescript
STABILITY_THRESHOLD = 0.97  // 97% del máximo

// Cambiar a 0.95 (más tolerante con fluctuaciones)
// STABILITY_THRESHOLD = 0.95

// Cambiar a 0.99 (más exigente)
// STABILITY_THRESHOLD = 0.99

requiredConsistentDrops = 4  // 4 mediciones bajando = caída

// Cambiar a 3 (más sensible a caídas)
// requiredConsistentDrops = 3

// Cambiar a 5 (menos sensible)
// requiredConsistentDrops = 5
```

---

## Validación en Tests

```typescript
// Test verifica variabilidad < 20%
// Esto significa: maxSpeed - minSpeed < 20% del promedio

// Con lógica inteligente:
// - 85-84-85-86-85 → variabilidad: 2%, PASA ✓
// - 85-75-65-55-45 → variabilidad: 47%, FALLA ✗
```

---

## Resumen

| Situación | Lógica Simple | Inteligente |
|-----------|--------------|-------------|
| 85→84→85→86 | ❌ Para | ✅ Continúa |
| 85→80→75→70 | ❌ Continúa | ✅ Para |
| 90→85→80→85 | ❌ Continúa | ✅ Continúa (recuperó) |
| 90→89→88→87 | ❌ Continúa | ✅ Para (caída real) |

**Conclusión**: La detección inteligente **distingue fluctuaciones normales de caídas reales** en el WiFi.
