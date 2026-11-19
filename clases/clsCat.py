from typing import Optional
from ClsPet import ClsPet


class ClsCat(ClsPet):
    def __init__(
        self,
        pet_id: int,
        cat_id: int,
        breed: Optional[str] = None,
        code: Optional[str] = None,
        name: Optional[str] = None,
        born_year: int = 0,
        color: Optional[str] = None,
        health_status: Optional[str] = None,
    ):
        super().__init__(
            pet_id=pet_id,
            code=code,
            name=name,
            born_year=born_year,
            color=color,
            health_status=health_status,
        )
        self._cat_id = cat_id
        self._breed = breed

    # Métodos propios y sobrescritos
    def self_cleaning(self) -> None:
        print(f"El gato {self.get_name()} se está limpiando.")

    def sound(self) -> None:
        print(f"El gato {self.get_name()} hace miaaauuu")

    def get_number_of_bones(self) -> int:
        return 230

    def get_animal_type(self) -> str:
        return "Cat"

    # Getters y Setters
    def get_cat_id(self) -> int:
        return self._cat_id

    def set_cat_id(self, cat_id: int) -> None:
        self._cat_id = cat_id

    def get_breed(self) -> Optional[str]:
        return self._breed

    def set_breed(self, breed: Optional[str]) -> None:
        self._breed = breed