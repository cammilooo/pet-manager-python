from cls_pet import ClsPet

class ClsDog(ClsPet):
    def __init__(self, dog_id: int = 0, breed: str = None, pedigree: bool = False,
                 pet_id: int = 0, code: str = None, name: str = None,
                 born_year: int = 0, color: str = None, health_status: str = None):
        super().__init__(pet_id, code, name, born_year, color, health_status)
        self.__dog_id = dog_id
        self.__breed = breed
        self.__pedigree = pedigree

    # Método sobrecargado adaptado a Python usando un parámetro opcional
    def walk_around(self, arg=None):
        if arg is None:
            print(f"El perro { self.name } está caminando.")
        elif isinstance(arg, int):
            print(f"El perro { self.name } está caminando {arg} km")
        elif isinstance(arg, bool):
            has_leash = "con correa" if arg else "sin correa"
            print(f"El perro { self.name } está caminando {has_leash}")

    def sound(self):
        print(f"El perro { self.name } hace Guuuuaaaauuu")

    def get_animal_type(self) -> str:
        return "Dog"

    def get_number_of_bones(self) -> int:
        return 320

    # Getters y Setters usando propiedades en Python
    @property
    def breed(self) -> str:
        return self.__breed

    @breed.setter
    def breed(self, value: str):
        self.__breed = value

    @property
    def pedigree(self) -> bool:
        return self.__pedigree

    @pedigree.setter
    def pedigree(self, value: bool):
        self.__pedigree = value

    @property
    def dog_id(self) -> int:
        return self.__dog_id

    @dog_id.setter
    def dog_id(self, value: int):
        self.__dog_id = value
