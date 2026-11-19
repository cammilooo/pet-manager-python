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

    # Sobrecarga alternativa equivalente a clsCat(int petId, int catId) de Java
    @classmethod
    def create_minimal(cls, pet_id: int, cat_id: int) -> "ClsCat":
        return cls(pet_id=pet_id, cat_id=cat_id)

    # Propiedades (Pythonic Getters & Setters)
    @property
    def cat_id(self) -> int:
        return self._cat_id

    @cat_id.setter
    def cat_id(self, cat_id: int) -> None:
        self._cat_id = cat_id

    @property
    def breed(self) -> Optional[str]:
        return self._breed

    @breed.setter
    def breed(self, breed: Optional[str]) -> None:
        self._breed = breed

    # Métodos de negocio y polimorfismo
    def self_cleaning(self) -> None:
        name_str = self.name if hasattr(self, "name") else self.get_name()
        print(f"El gato {name_str} se está limpiando.")

    def sound(self) -> None:
        name_str = self.name if hasattr(self, "name") else self.get_name()
        print(f"El gato {name_str} hace miaaauuu")

    def get_number_of_bones(self) -> int:
        return 230

    def get_animal_type(self) -> str:
        return "Cat"