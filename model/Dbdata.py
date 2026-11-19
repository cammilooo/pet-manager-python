from abc import ABC, abstractproperty


class IVertebrate(ABC):
    @property
    @abstractproperty
    def number_of_bones(self) -> int:
        """Retorna el número de huesos del vertebrado."""
        pass