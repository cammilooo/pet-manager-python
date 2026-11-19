import os

import pymysql


def conectar_bd():
    return pymysql.connect(
        host=os.getenv("PETMANAGER_DB_HOST", "localhost"),
        user=os.getenv("PETMANAGER_DB_USER", "root"),
        password=os.getenv("PETMANAGER_DB_PASSWORD", ""),
        database=os.getenv("PETMANAGER_DB_NAME", "administradormascotas"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )    