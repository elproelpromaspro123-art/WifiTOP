#!/usr/bin/env python3
"""
Script inteligente para limpiar archivos innecesarios del proyecto WifiTOP
Mantiene solo lo esencial para funcionalidad
"""

import os
import shutil
from pathlib import Path

# Raíz del proyecto
root = Path(".")

# Archivos/directorios a ELIMINAR
to_delete = [
    # Versiones antiguas de speedtest (reemplazadas por speedtest-real.ts)
    "lib/speedtest.ts",
    "lib/speedtest-improved.ts", 
    "lib/speedtest-fixed.ts",
    
    # APIs que causan problemas en Render
    "app/api/upload-test",
    "app/api/test-speedtest",
    "app/api/speedtest-proxy",
    
    # Configuración de Vercel (usamos Render)
    "vercel.json",
]

print("🧹 Limpiando archivos innecesarios...\n")

deleted_count = 0
for item in to_delete:
    path = root / item
    try:
        if path.is_file():
            os.remove(path)
            print(f"✓ Eliminado: {item}")
            deleted_count += 1
        elif path.is_dir():
            shutil.rmtree(path)
            print(f"✓ Eliminado directorio: {item}/")
            deleted_count += 1
        else:
            print(f"⚠ No existe: {item}")
    except Exception as e:
        print(f"✗ Error al eliminar {item}: {e}")

print(f"\n✅ Limpieza completada: {deleted_count} elementos eliminados")
print("\n📦 Estructura optimizada para Render Free Tier")
