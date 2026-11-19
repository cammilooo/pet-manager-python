class ClsDoctor:
    def __init__(self, name: str, licence: str):
        self._name = name
        self._licence = licence

    # Getters y Setters
    def get_name(self) -> str:
        return self._name

    def set_name(self, name: str) -> None:
        self._name = name

    def get_licence(self) -> str:
        return self._licence

    def set_licence(self, licence: str) -> None:
        self._licence = licence