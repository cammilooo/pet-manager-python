from typing import Optional
from AbstHospital import AbstHospital


class ClsVeterinary(AbstHospital):
    def __init__(
        self,
        name: str,
        phone: str,
        address: str,
        doctor: Optional["ClsDoctor"] = None,
        data: str = None,
    ):
        super().__init__(data=data)
        self._name = name
        self._phone = phone
        self._address = address
        self._doctor = doctor

    # Método de atención a mascotas
    def pet_care(self, pet: "ClsPet") -> str:
        print(f"Atendiendo a la mascota {pet.get_name()}")
        return pet.get_health_status()

    # Implementación de los métodos abstractos de AbstHospital
    def get_patient_type(self) -> str:
        return "Animal"

    def surgery(self) -> str:
        return "Surgery animal data"

    # Getters y Setters
    def get_name(self) -> str:
        return self._name

    def set_name(self, name: str) -> None:
        self._name = name

    def get_phone(self) -> str:
        return self._phone

    def set_phone(self, phone: str) -> None:
        self._phone = phone

    def get_address(self) -> str:
        return self._address

    def set_address(self, address: str) -> None:
        self._address = address

    def get_doctor(self) -> Optional["ClsDoctor"]:
        return self._doctor

    def set_doctor(self, doctor: Optional["ClsDoctor"]) -> None:
        self._doctor = doctor