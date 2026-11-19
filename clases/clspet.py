from abc import ABC, abstractmethod
from typing import Optional


# Interfaces equivalentes en Python (Módulo Interfaces)
class IAnimal(ABC):
    @abstractmethod
    def get_animal_type(self) -> str:
        pass


class IVertebrate(ABC):
    @abstractmethod
    def get_number_of_bones(self) -> int:
        pass


# Clase principal (Classes.clsPet)
class ClsPet(IAnimal, IVertebrate):
    def __init__(
        self,
        pet_id: int,
        code: str,
        name: str,
        born_year: int,
        color: str,
        health_status: str,
        veterinary: Optional["ClsVeterinary"] = None,
    ):
        self._pet_id = pet_id
        self._code = code
        self._name = name
        self._born_year = born_year
        self._color = color
        self._health_status = health_status
        self._veterinary = veterinary

    # Métodos propios
    def eat(self) -> None:
        print(f"La mascota {self._name} está comiendo.")

    def move(self) -> None:
        print(f"La mascota {self._name} está moviéndose.")

    def sound(self) -> None:
        print(f"La mascota {self._name} está relaizando el sonido.")

    # Implementación de IAnimal
    def get_animal_type(self) -> str:
        return "Pet"

    # Implementación de IVertebrate
    def get_number_of_bones(self) -> int:
        return 0

    # Getters y Setters
    def get_pet_id(self) -> int:
        return self._pet_id

    def set_pet_id(self, pet_id: int) -> None:
        self._pet_id = pet_id

    def get_code(self) -> str:
        return self._code

    def set_code(self, code: str) -> None:
        self._code = code

    def get_name(self) -> str:
        return self._name

    def set_name(self, name: str) -> None:
        self._name = name

    def get_born_year(self) -> int:
        return self._born_year

    def set_born_year(self, born_year: int) -> None:
        self._born_year = born_year

    def get_color(self) -> str:
        return self._color

    def set_color(self, color: str) -> None:
        self._color = color

    def get_health_status(self) -> str:
        return self._health_status

    def set_health_status(self, health_status: str) -> None:
        self._health_status = health_status

    def get_veterinary(self) -> Optional["ClsVeterinary"]:
        return self._veterinary

    def set_veterinary(self, veterinary: Optional["ClsVeterinary"]) -> None:
        self._veterinary = veterinary