from typing import List, Optional
import mysql.connector
from DbData import DbData
from ClsCat import ClsCat
from ClsPet import ClsPet
from ClsReportByHealthStatus import ClsReportByHealthStatus


class ModelCat:
    def __init__(self):
        self.db_data = DbData()

    def _get_connection(self):
        return mysql.connector.connect(
            host=self.db_data.host,
            user=self.db_data.user,
            password=self.db_data.password,
            database=self.db_data.database,
            port=self.db_data.port,
        )

    def create_pet(self, cat: ClsCat) -> bool:
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            query_pet = (
                "INSERT INTO tb_pet (code, name, born_year, color, health_status) "
                "VALUES (%s, %s, %s, %s, %s)"
            )
            values_pet = (
                cat.get_code(),
                cat.get_name(),
                cat.get_born_year(),
                cat.get_color(),
                cat.get_health_status(),
            )
            cursor.execute(query_pet, values_pet)

            if cursor.rowcount > 0:
                id_pet = cursor.lastrowid
                query_cat = "INSERT INTO tb_cat (breed, id_pet) VALUES (%s, %s)"
                values_cat = (cat.get_breed(), id_pet)
                cursor.execute(query_cat, values_cat)

                if cursor.rowcount > 0:
                    conn.commit()
                    return True

            conn.rollback()
            return False
        except mysql.connector.Error as e:
            if conn:
                conn.rollback()
            print(f"Error en create_pet: {e}")
            return False
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def search_pet(self, code: str) -> Optional[ClsCat]:
        conn = None
        cat = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            query = (
                "SELECT p.id, p.code, p.name, p.born_year, p.color, p.health_status, "
                "c.id_cat, c.breed "
                "FROM tb_pet AS p INNER JOIN tb_cat AS c ON p.id = c.id_pet "
                "WHERE p.code = %s"
            )
            cursor.execute(query, (code,))
            row = cursor.fetchone()

            if row:
                (
                    pet_id,
                    pet_code,
                    pet_name,
                    pet_born_year,
                    pet_color,
                    pet_health_status,
                    cat_id,
                    pet_breed,
                ) = row
                cat = ClsCat(
                    cat_id=cat_id,
                    breed=pet_breed,
                    pet_id=pet_id,
                    code=pet_code,
                    name=pet_name,
                    born_year=pet_born_year,
                    color=pet_color,
                    health_status=pet_health_status,
                )
            return cat
        except mysql.connector.Error as e:
            print(f"Error en search_pet: {e}")
            return cat
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def edit_pet(self, cat: ClsCat) -> bool:
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            query_pet = (
                "UPDATE tb_pet SET code = %s, name = %s, born_year = %s, "
                "color = %s, health_status = %s WHERE id = %s"
            )
            values_pet = (
                cat.get_code(),
                cat.get_name(),
                cat.get_born_year(),
                cat.get_color(),
                cat.get_health_status(),
                cat.get_pet_id(),
            )
            cursor.execute(query_pet, values_pet)
            rows_pet = cursor.rowcount

            # Nota: Corregida la coma extra del SQL original ("SET breed = ?, WHERE")
            query_cat = "UPDATE tb_cat SET breed = %s WHERE id_cat = %s"
            values_cat = (cat.get_breed(), cat.get_cat_id())
            cursor.execute(query_cat, values_cat)
            rows_cat = cursor.rowcount

            if rows_pet > 0 and rows_cat > 0:
                conn.commit()
                return True
            else:
                conn.rollback()
                return False
        except mysql.connector.Error as e:
            if conn:
                conn.rollback()
            print(f"Error en edit_pet: {e}")
            return False
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def delete_pet(self, cat: ClsCat) -> bool:
        conn = None
        try:
            conn = self._get_connection()
            conn.start_transaction()
            cursor = conn.cursor()

            # En MySQL/MariaDB la clave foránea exige eliminar primero la tabla hija (tb_cat)
            query_cat = "DELETE FROM tb_cat WHERE id_cat = %s"
            cursor.execute(query_cat, (cat.get_cat_id(),))
            rows_cat = cursor.rowcount

            query_pet = "DELETE FROM tb_pet WHERE id = %s"
            cursor.execute(query_pet, (cat.get_pet_id(),))
            rows_pet = cursor.rowcount

            if rows_pet > 0 and rows_cat > 0:
                conn.commit()
                return True
            else:
                conn.rollback()
                return False
        except mysql.connector.Error as e:
            if conn:
                conn.rollback()
            print(f"Error en delete_pet: {e}")
            return False
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def list_pet(self) -> List[ClsPet]:
        cat_list: List[ClsPet] = []
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            query = (
                "SELECT p.id, p.code, p.name, p.born_year, p.color, p.health_status, "
                "c.id_cat, c.breed "
                "FROM tb_pet AS p INNER JOIN tb_cat AS c ON p.id = c.id_pet"
            )
            cursor.execute(query)
            rows = cursor.fetchall()

            for row in rows:
                (
                    pet_id,
                    pet_code,
                    pet_name,
                    pet_born_year,
                    pet_color,
                    pet_health_status,
                    cat_id,
                    pet_breed,
                ) = row
                cat = ClsCat(
                    cat_id=cat_id,
                    breed=pet_breed,
                    pet_id=pet_id,
                    code=pet_code,
                    name=pet_name,
                    born_year=pet_born_year,
                    color=pet_color,
                    health_status=pet_health_status,
                )
                cat_list.append(cat)
            return cat_list
        except mysql.connector.Error as e:
            print(f"Error en list_pet: {e}")
            return cat_list
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def list_pet_by_health_status(self) -> List[ClsReportByHealthStatus]:
        report: List[ClsReportByHealthStatus] = []
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            query = (
                "SELECT health_status, COUNT(health_status) FROM tb_pet "
                "GROUP BY health_status"
            )
            cursor.execute(query)
            rows = cursor.fetchall()

            for row in rows:
                record = ClsReportByHealthStatus()
                record.set_health_status(row[0])
                record.set_amount_of_pets_by_health_status(row[1])
                report.append(record)
            return report
        except mysql.connector.Error as e:
            print(f"Error en list_pet_by_health_status: {e}")
            return report
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def list_cat_by_health_status(self) -> List[ClsReportByHealthStatus]:
        report: List[ClsReportByHealthStatus] = []
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            query = (
                "SELECT a.health_status, COUNT(a.health_status) FROM ("
                "SELECT p.code, p.name, p.born_year, p.color, p.health_status, c.breed "
                "FROM tb_pet AS p INNER JOIN tb_cat AS c ON p.id = c.id_pet"
                ") a GROUP BY a.health_status"
            )
            cursor.execute(query)
            rows = cursor.fetchall()

            for row in rows:
                record = ClsReportByHealthStatus()
                record.set_health_status(row[0])
                record.set_amount_of_pets_by_health_status(row[1])
                report.append(record)
            return report
        except mysql.connector.Error as e:
            print(f"Error en list_cat_by_health_status: {e}")
            return report
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()