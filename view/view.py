from datetime import datetime
from pathlib import Path
import sys
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

import openpyxl
import pymysql
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from model.conexion import conectar_bd


class PetStore:
    """MySQL storage using the project's tb_pet, tb_dog, and tb_cat tables."""

    def _connect(self):
        connection = conectar_bd()
        if connection is None:
            raise pymysql.MySQLError("The database connection could not be established.")
        return connection

    def list_pets(self, kind=None):
        connection = self._connect()
        cursor = connection.cursor()
        query = """
            SELECT p.id, p.code, p.name, p.born_year, p.color,
                   p.health_status, d.breed, d.pedigree, 'Dog' AS kind
            FROM tb_pet AS p
            INNER JOIN tb_dog AS d ON d.id_pet = p.id
            UNION ALL
            SELECT p.id, p.code, p.name, p.born_year, p.color,
                   p.health_status, c.breed, 0 AS pedigree, 'Cat' AS kind
            FROM tb_pet AS p
            INNER JOIN tb_cat AS c ON c.id_pet = p.id
        """
        parameters = ()
        if kind:
            query = f"SELECT * FROM ({query}) AS pets WHERE kind = %s"
            parameters = (kind,)
        query += " ORDER BY name, code"
        try:
            cursor.execute(query, parameters)
            return cursor.fetchall()
        finally:
            cursor.close()
            connection.close()

    def create_pet(self, pet):
        connection = self._connect()
        cursor = connection.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO tb_pet (code, name, born_year, color, health_status)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    pet["code"],
                    pet["name"],
                    pet["born_year"],
                    pet["color"],
                    pet["health_status"],
                ),
            )
            pet_id = cursor.lastrowid
            if pet["kind"] == "Dog":
                cursor.execute(
                    "INSERT INTO tb_dog (breed, pedigree, id_pet) VALUES (%s, %s, %s)",
                    (pet["breed"], pet["pedigree"], pet_id),
                )
            else:
                cursor.execute(
                    "INSERT INTO tb_cat (breed, id_pet) VALUES (%s, %s)",
                    (pet["breed"], pet_id),
                )
            connection.commit()
        except pymysql.MySQLError:
            connection.rollback()
            raise
        finally:
            cursor.close()
            connection.close()

    def update_pet(self, pet, pet_id):
        connection = self._connect()
        cursor = connection.cursor()
        child_table = "tb_dog" if pet["kind"] == "Dog" else "tb_cat"
        try:
            cursor.execute(
                f"""
                SELECT p.id FROM tb_pet AS p
                INNER JOIN {child_table} AS child ON child.id_pet = p.id
                WHERE p.id = %s
                """,
                (pet_id,),
            )
            if cursor.fetchone() is None:
                return False
            cursor.execute(
                """
                UPDATE tb_pet
                SET code = %s, name = %s, born_year = %s, color = %s, health_status = %s
                WHERE id = %s
                """,
                (
                    pet["code"],
                    pet["name"],
                    pet["born_year"],
                    pet["color"],
                    pet["health_status"],
                    pet_id,
                ),
            )
            if pet["kind"] == "Dog":
                cursor.execute(
                    "UPDATE tb_dog SET breed = %s, pedigree = %s WHERE id_pet = %s",
                    (pet["breed"], pet["pedigree"], pet_id),
                )
            else:
                cursor.execute(
                    "UPDATE tb_cat SET breed = %s WHERE id_pet = %s",
                    (pet["breed"], pet_id),
                )
            connection.commit()
            return True
        except pymysql.MySQLError:
            connection.rollback()
            raise
        finally:
            cursor.close()
            connection.close()

    def delete_pet(self, kind, code):
        connection = self._connect()
        cursor = connection.cursor()
        child_table = "tb_dog" if kind == "Dog" else "tb_cat"
        try:
            cursor.execute(
                f"""
                SELECT p.id FROM tb_pet AS p
                INNER JOIN {child_table} AS child ON child.id_pet = p.id
                WHERE p.code = %s
                """,
                (code,),
            )
            row = cursor.fetchone()
            if row is None:
                return False
            pet_id = row["id"]
            cursor.execute(f"DELETE FROM {child_table} WHERE id_pet = %s", (pet_id,))
            cursor.execute("DELETE FROM tb_pet WHERE id = %s", (pet_id,))
            connection.commit()
            return True
        except pymysql.MySQLError:
            connection.rollback()
            raise
        finally:
            cursor.close()
            connection.close()

    def health_report(self, kind=None):
        connection = self._connect()
        cursor = connection.cursor()
        if kind == "Dog":
            source = "INNER JOIN tb_dog AS child ON child.id_pet = p.id"
            parameters = ()
        elif kind == "Cat":
            source = "INNER JOIN tb_cat AS child ON child.id_pet = p.id"
            parameters = ()
        else:
            source = ""
            parameters = ()
        try:
            cursor.execute(
                f"""
                SELECT p.health_status, COUNT(*) AS amount
                FROM tb_pet AS p {source}
                GROUP BY p.health_status
                ORDER BY p.health_status
                """,
                parameters,
            )
            return cursor.fetchall()
        finally:
            cursor.close()
            connection.close()


class FrmPet(tk.Tk):
    HEALTH_STATUSES = ("Sick", "Healthy", "In Surgery")
    DOG_BREEDS = ("Criollo", "Schnauzer", "German shepherd", "Pincher")
    CAT_BREEDS = ("Birman", "British", "Bombay", "Abyssinian")

    def __init__(self):
        super().__init__()
        self.title("Pet Manager")
        self.geometry("1080x650")
        self.minsize(900, 560)

        try:
            self.store = PetStore()
            connection = self.store._connect()
            connection.close()
        except pymysql.MySQLError as error:
            messagebox.showerror("Database connection error", str(error))
            self.destroy()
            raise

        self.forms = {}
        self.listboxes = {}
        self.report_canvases = {}
        self.searched_pet_ids = {"Dog": None, "Cat": None}
        self._init_components()
        try:
            self.refresh_all()
        except pymysql.MySQLError as error:
            messagebox.showerror("Database error", str(error))
            self.destroy()
            raise

    def _init_components(self):
        ttk.Label(self, text="Pet Manager", font=("Helvetica", 18, "bold")).pack(pady=10)

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=5)

        self.tabs = {
            "pets": ttk.Frame(self.notebook),
            "Dog manager": ttk.Frame(self.notebook),
            "Cat manager": ttk.Frame(self.notebook),
            "Dogs": ttk.Frame(self.notebook),
            "Cats": ttk.Frame(self.notebook),
            "Health report": ttk.Frame(self.notebook),
            "Dog report": ttk.Frame(self.notebook),
            "Cat report": ttk.Frame(self.notebook),
        }
        for name, tab in self.tabs.items():
            self.notebook.add(tab, text="Pet List" if name == "pets" else name)

        for key, title in (("pets", "All pets"), ("Dogs", "Dogs"), ("Cats", "Cats")):
            frame = ttk.Frame(self.tabs[key], padding=10)
            frame.pack(fill="both", expand=True)
            ttk.Label(frame, text=title, font=("Helvetica", 12, "bold")).pack(anchor="w")
            listbox = tk.Listbox(frame, height=16)
            listbox.pack(fill="both", expand=True, pady=(8, 0))
            self.listboxes[key] = listbox

        self._build_manager_form("Dog")
        self._build_manager_form("Cat")

        buttons = ttk.Frame(self)
        buttons.pack(pady=10)
        for column, (label, callback) in enumerate(
            (
                ("Export Pet List", lambda: self.export_pets()),
                ("Export Dog List", lambda: self.export_pets("Dog")),
                ("Export Cat List", lambda: self.export_pets("Cat")),
                ("Refresh", self.btn_restart_action),
            )
        ):
            ttk.Button(buttons, text=label, command=callback).grid(
                row=0, column=column, padx=8
            )

    def _build_manager_form(self, kind):
        frame = self.tabs[f"{kind} manager"]
        form = {}
        fields = (
            ("code", "Code"),
            ("name", "Name"),
            ("born_year", "Born year"),
            ("color", "Color"),
        )
        for index, (key, label) in enumerate(fields):
            row, column = divmod(index, 2)
            ttk.Label(frame, text=label).grid(
                row=row, column=column * 2, padx=8, pady=8, sticky="e"
            )
            entry = ttk.Entry(frame, width=28)
            entry.grid(row=row, column=column * 2 + 1, padx=8, pady=8, sticky="w")
            form[key] = entry

        ttk.Label(frame, text="Health Status").grid(
            row=2, column=0, padx=8, pady=8, sticky="e"
        )
        form["health_status"] = ttk.Combobox(
            frame, values=self.HEALTH_STATUSES, state="readonly", width=25
        )
        form["health_status"].current(0)
        form["health_status"].grid(row=2, column=1, padx=8, pady=8, sticky="w")

        ttk.Label(frame, text="Breed").grid(
            row=2, column=2, padx=8, pady=8, sticky="e"
        )
        breeds = self.DOG_BREEDS if kind == "Dog" else self.CAT_BREEDS
        form["breed"] = ttk.Combobox(frame, values=breeds, state="readonly", width=25)
        form["breed"].current(0)
        form["breed"].grid(row=2, column=3, padx=8, pady=8, sticky="w")

        if kind == "Dog":
            form["pedigree"] = tk.BooleanVar(value=False)
            ttk.Checkbutton(
                frame, text="Pedigree", variable=form["pedigree"]
            ).grid(row=3, column=1, padx=8, pady=8, sticky="w")

        button_frame = ttk.Frame(frame)
        button_frame.grid(row=4, column=0, columnspan=4, pady=18)
        actions = (
            ("Save", lambda: self._save_pet(kind)),
            ("Search", lambda: self._search_pet(kind)),
            ("Edit", lambda: self._edit_pet(kind)),
            ("Delete", lambda: self._delete_pet(kind)),
            ("Clear", lambda: self._clear_form(kind)),
        )
        for label, callback in actions:
            ttk.Button(button_frame, text=label, command=callback).pack(
                side="left", padx=5
            )
        self.forms[kind] = form

    def _read_form(self, kind):
        form = self.forms[kind]
        pet = {
            "kind": kind,
            "code": form["code"].get().strip(),
            "name": form["name"].get().strip(),
            "color": form["color"].get().strip(),
            "health_status": form["health_status"].get(),
            "breed": form["breed"].get(),
            "pedigree": int(form["pedigree"].get()) if kind == "Dog" else 0,
        }
        try:
            pet["born_year"] = int(form["born_year"].get().strip())
        except ValueError as error:
            raise ValueError("Enter a valid birth year.") from error
        if not all(
            pet[key]
            for key in ("code", "name", "color", "health_status", "breed")
        ):
            raise ValueError("Fill in all fields.")
        field_limits = {
            "code": 3,
            "name": 50,
            "color": 20,
            "health_status": 30,
            "breed": 30,
        }
        for field, limit in field_limits.items():
            if len(pet[field]) > limit:
                raise ValueError(
                    f"{field.replace('_', ' ').capitalize()} must be "
                    f"{limit} characters or fewer."
                )
        if pet["born_year"] < 1900 or pet["born_year"] > datetime.now().year:
            raise ValueError("Birth year must be between 1900 and the current year.")
        return pet

    def _save_pet(self, kind):
        try:
            self.store.create_pet(self._read_form(kind))
        except ValueError as error:
            messagebox.showwarning("Invalid information", str(error))
            return
        except pymysql.err.IntegrityError:
            messagebox.showerror("Duplicate code", "A pet with this code already exists.")
            return
        except pymysql.MySQLError as error:
            messagebox.showerror("Database error", f"Could not save the pet:\n{error}")
            return
        try:
            self._after_change(kind, "The record has been saved.")
        except pymysql.MySQLError as error:
            messagebox.showerror(
                "Refresh error",
                f"The pet was saved, but the lists could not be refreshed:\n{error}",
            )

    def _search_pet(self, kind):
        code = self.forms[kind]["code"].get().strip()
        if not code:
            messagebox.showwarning("Code required", "Enter the pet code to search.")
            return
        try:
            pet = next(
                (
                    row
                    for row in self.store.list_pets(kind)
                    if row["code"].casefold() == code.casefold()
                ),
                None,
            )
        except pymysql.MySQLError as error:
            messagebox.showerror("Database error", f"Could not search for the pet:\n{error}")
            return
        if pet is None:
            self.searched_pet_ids[kind] = None
            messagebox.showinfo("Not found", "No pet was found with that code.")
            return
        self.searched_pet_ids[kind] = pet["id"]
        form = self.forms[kind]
        for key in ("name", "born_year", "color"):
            form[key].delete(0, tk.END)
            form[key].insert(0, str(pet[key]))
        form["health_status"].set(pet["health_status"])
        form["breed"].set(pet["breed"])
        if kind == "Dog":
            form["pedigree"].set(bool(pet["pedigree"]))

    def _edit_pet(self, kind):
        pet_id = self.searched_pet_ids[kind]
        if pet_id is None:
            messagebox.showwarning(
                "Search required", "Search for the pet before editing it."
            )
            return
        try:
            pet = self._read_form(kind)
            if not self.store.update_pet(pet, pet_id):
                self.searched_pet_ids[kind] = None
                messagebox.showinfo("Not found", "Search an existing pet before editing.")
                return
        except ValueError as error:
            messagebox.showwarning("Invalid information", str(error))
            return
        except pymysql.MySQLError as error:
            messagebox.showerror("Database error", f"Could not update the pet:\n{error}")
            return
        self.searched_pet_ids[kind] = None
        try:
            self._after_change(kind, "The record has been updated.")
        except pymysql.MySQLError as error:
            messagebox.showerror(
                "Refresh error",
                f"The pet was updated, but the lists could not be refreshed:\n{error}",
            )

    def _delete_pet(self, kind):
        code = self.forms[kind]["code"].get().strip()
        if not code:
            messagebox.showwarning("Code required", "Search for a pet before deleting it.")
            return
        if not messagebox.askyesno("Confirm deletion", f"Delete {kind.lower()} {code}?"):
            return
        try:
            deleted = self.store.delete_pet(kind, code)
        except pymysql.MySQLError as error:
            messagebox.showerror("Database error", f"Could not delete the pet:\n{error}")
            return
        if not deleted:
            messagebox.showinfo("Not found", "No pet was found with that code.")
            return
        self.searched_pet_ids[kind] = None
        self._after_change(kind, "The pet has been deleted.")

    def _after_change(self, kind, message):
        self.refresh_all()
        self._clear_form(kind)
        messagebox.showinfo("Pet Manager", message)

    def _clear_form(self, kind):
        self.searched_pet_ids[kind] = None
        form = self.forms[kind]
        for key in ("code", "name", "born_year", "color"):
            form[key].delete(0, tk.END)
        form["health_status"].current(0)
        form["breed"].current(0)
        if kind == "Dog":
            form["pedigree"].set(False)

    def refresh_all(self):
        all_pets = self.store.list_pets()
        for key, kind in (("pets", None), ("Dogs", "Dog"), ("Cats", "Cat")):
            listbox = self.listboxes[key]
            listbox.delete(0, tk.END)
            pets = all_pets if kind is None else [
                pet for pet in all_pets if pet["kind"] == kind
            ]
            for pet in pets:
                listbox.insert(
                    tk.END,
                    f'{pet["name"]} - {pet["code"]} - {pet["kind"]} - '
                    f'{pet["health_status"]}',
                )
        self._refresh_report("Health report", None, pie=True)
        self._refresh_report("Dog report", "Dog")
        self._refresh_report("Cat report", "Cat", horizontal=True)

    def _refresh_report(self, tab_name, kind, pie=False, horizontal=False):
        frame = self.tabs[tab_name]
        for widget in frame.winfo_children():
            widget.destroy()
        report = self.store.health_report(kind)
        labels = [row["health_status"] for row in report]
        values = [row["amount"] for row in report]
        figure = Figure(figsize=(6, 3.5), dpi=100)
        axes = figure.add_subplot(111)
        if values:
            if pie:
                axes.pie(values, labels=labels, autopct="%1.1f%%", startangle=90)
            elif horizontal:
                axes.barh(labels, values)
            else:
                axes.bar(labels, values)
        else:
            axes.text(0.5, 0.5, "No pet data", ha="center", va="center")
            axes.set_axis_off()
        axes.set_title(f"{kind or 'Pets'} by health status")
        if not pie:
            axes.set_xlabel("Amount")
            axes.set_ylabel("Health status")
        canvas = FigureCanvasTkAgg(figure, master=frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)
        self.report_canvases[tab_name] = canvas

    def export_pets(self, kind=None):
        pets = self.store.list_pets(kind)
        headers = ["AnimalType", "Code", "Name", "Born year", "Color", "Health Status", "Breed"]
        if kind != "Cat":
            headers.append("Pedigree")
        workbook = openpyxl.Workbook()
        sheet = workbook.active
        sheet.title = "Pets" if kind is None else f"{kind}s"
        sheet.append(headers)
        for pet in pets:
            row = [
                pet["kind"],
                pet["code"],
                pet["name"],
                pet["born_year"],
                pet["color"],
                pet["health_status"],
                pet["breed"],
            ]
            if kind != "Cat":
                row.append("Yes" if pet["pedigree"] else "No" if pet["kind"] == "Dog" else "")
            sheet.append(row)

        filename = filedialog.asksaveasfilename(
            title="Export pet list",
            defaultextension=".xlsx",
            initialfile=f"{(kind or 'pet').lower()}_list_{datetime.now():%Y_%m_%d}.xlsx",
            filetypes=(("Excel workbook", "*.xlsx"),),
        )
        if not filename:
            return
        try:
            workbook.save(filename)
        except (OSError, PermissionError) as error:
            messagebox.showerror("Export error", f"Could not save the workbook:\n{error}")
            return
        messagebox.showinfo("Export complete", f"File exported to:\n{filename}")

    def btn_restart_action(self):
        for kind in ("Dog", "Cat"):
            self._clear_form(kind)
        self.refresh_all()



if __name__ == "__main__":
    app = FrmPet()
    app.mainloop()

def probar():
    conexion = conectar_bd()
    if conexion:
        print("¡Conexión exitosa desde el archivo externo!")
        conexion.close()

if __name__ == "__main__":
    probar()
    # Si aquí abres tu ventana (por ejemplo: app = frmPet(), app.mainloop()), 
    # puedes dejar la función probar() antes para que imprima en la consola al iniciar.