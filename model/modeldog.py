from typing import List, Optional
import mysql.connector
from DbData import DbData
from ClsDog import ClsDog
from ClsPet import ClsPet
from ClsReportByHealthStatus import ClsReportByHealthStatus


class ModelDog:
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

    def create_pet(self, dog: ClsDog) -> bool:
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            query_pet = (
                "INSERT INTO tb_pet (code, name, born_year, color, health_status) "
                "VALUES (%s, %s, %s, %s, %s)"
            )
            values_pet = (
                dog.get_code(),
                dog.get_name(),
                dog.get_born_year(),
                dog.get_color(),
                dog.get_health_status(),
            )
            cursor.execute(query_pet, values_pet)

            if cursor.rowcount > 0:
                id_pet = cursor.lastrowid
                query_dog = "INSERT INTO tb_dog (breed, pedigree, id_pet) VALUES (%s, %s, %s)"
                values_dog = (dog.get_breed(), dog.is_pedigree(), id_pet)
                cursor.execute(query_dog, values_dog)

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

    def search_pet(self, code: str) -> Optional[ClsDog]:
        conn = None
        dog = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            query = (
                "SELECT p.id, p.code, p.name, p.born_year, p.color, p.health_status, "
                "d.id_dog, d.breed, d.pedigree "
                "FROM tb_pet AS p INNER JOIN tb_dog AS d ON p.id = d.id_pet "
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
                    dog_id,
                    pet_breed,
                    pet_pedigree,
                ) = row
                dog = ClsDog(
                    dog_id=dog_id,
                    breed=pet_breed,
                    pedigree=bool(pet_pedigree),
                    pet_id=pet_id,
                    code=pet_code,
                    name=pet_name,
                    born_year=pet_born_year,
                    color=pet_color,
                    health_status=pet_health_status,
                )
            return dog
        except mysql.connector.Error as e:
            print(f"Error en search_pet: {e}")
            return dog
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def edit_pet(self, dog: ClsDog) -> bool:
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            query_pet = (
                "UPDATE tb_pet SET code = %s, name = %s, born_year = %s, "
                "color = %s, health_status = %s WHERE id = %s"
            )
            values_pet = (
                dog.get_code(),
                dog.get_name(),
                dog.get_born_year(),
                dog.get_color(),
                dog.get_health_status(),
                dog.get_pet_id(),
            )
            cursor.execute(query_pet, values_pet)
            rows_pet = cursor.rowcount

            query_dog = "UPDATE tb_dog SET breed = %s, pedigree = %s WHERE id_dog = %s"
            values_dog = (dog.get_breed(), dog.is_pedigree(), dog.get_dog_id())
            cursor.execute(query_dog, values_dog)
            rows_dog = cursor.rowcount

            if rows_pet > 0 and rows_dog > 0:
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

    def delete_pet(self, dog: ClsDog) -> bool:
        conn = None
        try:
            conn = self._get_connection()
            conn.start_transaction()
            cursor = conn.cursor()

            # En MySQL la clave foránea exige eliminar primero la tabla hija (tb_dog)
            query_dog = "DELETE FROM tb_dog WHERE id_dog = %s"
            cursor.execute(query_dog, (dog.get_dog_id(),))
            rows_dog = cursor.rowcount

            query_pet = "DELETE FROM tb_pet WHERE id = %s"
            cursor.execute(query_pet, (dog.get_pet_id(),))
            rows_pet = cursor.rowcount

            if rows_pet > 0 and rows_dog > 0:
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
        dog_list: List[ClsPet] = []
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            query = (
                "SELECT p.id, p.code, p.name, p.born_year, p.color, p.health_status, "
                "d.id_dog, d.breed, d.pedigree "
                "FROM tb_pet AS p INNER JOIN tb_dog AS d ON p.id = d.id_pet"
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
                    dog_id,
                    pet_breed,
                    pet_pedigree,
                ) = row
                dog = ClsDog(
                    dog_id=dog_id,
                    breed=pet_breed,
                    pedigree=bool(pet_pedigree),
                    pet_id=pet_id,
                    code=pet_code,
                    name=pet_name,
                    born_year=pet_born_year,
                    color=pet_color,
                    health_status=pet_health_status,
                )
                dog_list.append(dog)
            return dog_list
        except mysql.connector.Error as e:
            print(f"Error en list_pet: {e}")
            return dog_list
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

    def list_dog_by_health_status(self) -> List[ClsReportByHealthStatus]:
        report: List[ClsReportByHealthStatus] = []
        conn = None
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            query = (
                "SELECT a.health_status, COUNT(a.health_status) FROM ("
                "SELECT p.code, p.name, p.born_year, p.color, p.health_status, d.breed, d.pedigree "
                "FROM tb_pet AS p INNER JOIN tb_dog AS d ON p.id = d.id_pet"
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
            print(f"Error en list_dog_by_health_status: {e}")
            return report
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()