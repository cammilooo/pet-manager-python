class ClsReportByHealthStatus:
    def __init__(self, health_status: str = "", amount_of_pets_by_health_status: int = 0):
        self._health_status = health_status
        self._amount_of_pets_by_health_status = amount_of_pets_by_health_status

    # Getters y Setters
    def get_health_status(self) -> str:
        return self._health_status

    def set_health_status(self, health_status: str) -> None:
        self._health_status = health_status

    def get_amount_of_pets_by_health_status(self) -> int:
        return self._amount_of_pets_by_health_status

    def set_amount_of_pets_by_health_status(self, amount_of_pets_by_health_status: int) -> None:
        self._amount_of_pets_by_health_status = amount_of_pets_by_health_status