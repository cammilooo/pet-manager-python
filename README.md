# Pet Manager

Aplicacion de escritorio en Python para administrar perros y gatos, consultar
reportes por estado de salud y exportar listados a Excel.

## Requisitos

- Python 3.10 o posterior
- MySQL en ejecucion
- Base de datos `administradormascotas` con las tablas `tb_pet`, `tb_dog` y
  `tb_cat`

## Instalacion y ejecucion (Windows / PowerShell)

Desde la carpeta del proyecto:

```powershell
py -m pip install -r requirements.txt
py .\view\view.py
```

La conexion por defecto usa `localhost`, el usuario `root`, contraseña vacia y
la base `administradormascotas`. Configura otras credenciales con variables de
entorno antes de iniciar la aplicacion:

```powershell
$env:PETMANAGER_DB_HOST = "localhost"
$env:PETMANAGER_DB_USER = "root"
$env:PETMANAGER_DB_PASSWORD = "tu-clave"
$env:PETMANAGER_DB_NAME = "administradormascotas"
py .\view\view.py
```

No guardes contraseñas ni datos locales en el repositorio. Los archivos de
base de datos, configuracion local y exportaciones estan excluidos mediante
`.gitignore`.
