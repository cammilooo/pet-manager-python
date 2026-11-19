from abc import ABC, abstractmethod


class AbstHospital(ABC):
    def __init__(self, data: str = None):
        self._data = data

    @abstractmethod
    def get_patient_type( me ) -> str:
        pass

    @abstractmethod
    def surgery(self) -> str:
        pass

    def get_hospital_information(self) -> str:
        return f"La información es: {self.get_data()}"

    def get_data(self) -> str:
        return self._data

    def set_data(self, data: str) -> None:
        self._data = data