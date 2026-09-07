# Python y Azurite: listar blobs y consultar propiedades

Este ejercicio conecta Python con el servicio local de Blob Storage. Primero
realiza consultas de lectura y después agrega metadata descriptiva al blob:

```text
Python
   ↓
Azurite
   ↓
blob container "raw"
   ↓
listar blobs
   ↓
consultar propiedades de medicare_inpatient_2024.json
   ↓
agregar metadata de fuente, año y dataset
```

El script utilizado es:

```text
python/storage/list_raw_blobs.py
```

## Qué hizo realmente el primer listado

El script **no leyó el archivo desde el disco de Windows**. No abrió
`data/raw/medicare_inpatient_2024.json` ni recorrió sus 145,879 filas.

Esta llamada:

```python
container_client.list_blobs()
```

envió una solicitud al servicio de Blob Storage que se está ejecutando en
Azurite. La pregunta fue conceptualmente:

> ¿Qué objetos existen dentro del blob container `raw`?

Azurite respondió con los objetos que conoce y Python imprimió sus nombres. El
SDK oficial documenta `list_blobs()` como la operación para enumerar los blobs
de un container: [List blobs with Python](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-list-python).

## Qué son las propiedades de un blob

Un blob tiene datos y también información técnica acerca de esos datos. Entre
sus propiedades se encuentran:

- nombre;
- tamaño en bytes;
- tipo de contenido;
- fecha de última modificación;
- ETag.

El **ETag** es un identificador de la versión actual del objeto. Si el objeto
cambia, normalmente cambia también su ETag.

No es necesario descargar ni abrir todas las filas del JSON para responder
preguntas como:

> ¿Cuánto pesa el blob almacenado?

## Consultar las propiedades sin descargar el contenido

Primero, el script obtiene un cliente que apunta al objeto concreto:

```python
blob_client = container_client.get_blob_client(
    "medicare_inpatient_2024.json"
)
```

Después consulta sus propiedades:

```python
properties = blob_client.get_blob_properties()
```

`get_blob_properties()` pide información técnica a Azurite. No utiliza
`download_blob()` y, por lo tanto, **no descarga el contenido del JSON**.
Microsoft documenta esta operación como la lectura de todas las propiedades y
metadatos definidos por el usuario del blob: [Get Blob Properties](https://learn.microsoft.com/en-us/rest/api/storageservices/get-blob-properties).

## Guardar la conexión en un archivo `.env` local

El código no contiene la cadena de conexión. La lee desde esta variable de
entorno:

```text
AZURE_STORAGE_CONNECTION_STRING
```

Para no volver a escribirla al abrir cada PowerShell, su valor local está en el
archivo `.env` de la raíz del repositorio. `python-dotenv` carga ese archivo al
iniciar el script.

El `.gitignore` excluye `.env`, por lo que la conexión local no se sube a
GitHub. El repositorio incluye únicamente `.env.example`, una plantilla sin
credenciales que explica el nombre de la variable necesaria.

Después de clonar el repositorio en otra computadora, se debe copiar la
plantilla y completar localmente el valor:

```powershell
Copy-Item .env.example .env
```

Nunca se deben guardar credenciales reales de Azure en `.env.example`.

## Agregar metadata definida por el usuario

El script también agrega esta metadata técnica al blob:

```text
source: cms
reporting_year: 2024
dataset: medicare_inpatient_by_provider_and_service
```

Estos valores describen la fuente pública, el año y el dataset. No contienen
datos de pacientes, credenciales ni información personal.

Esta operación sí modifica el blob:

```python
blob_client.set_blob_metadata(metadata)
```

Por esa razón, al ejecutar el script puede cambiar el ETag y la fecha de última
modificación. El contenido del JSON no se descarga ni se reemplaza, pero su
metadata sí se escribe en Azurite.

Luego el script vuelve a pedir las propiedades para mostrar el estado nuevo:

```python
updated_properties = blob_client.get_blob_properties()
```

## Instalar las dependencias

El SDK de Blob Storage y el cargador del archivo `.env` están registrados en
`requirements.txt`:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Las herramientas utilizadas son:

```text
azure-storage-blob
python-dotenv
```

## Ejecutar el ejercicio

Azurite debe estar activo. Se puede comprobar con:

```powershell
docker ps
```

Después se ejecuta el script con el Python del entorno virtual:

```powershell
.\.venv\Scripts\python.exe .\python\storage\list_raw_blobs.py
```

El resultado debe tener esta forma:

```text
Blobs in the raw container:
medicare_inpatient_2024.json

User-defined metadata:
source: cms
reporting_year: 2024
dataset: medicare_inpatient_by_provider_and_service

Blob properties:
Name: medicare_inpatient_2024.json
Size: 101964930 bytes
Content type: application/json
Last modified: <fecha y hora devueltas por Azurite>
ETag: <identificador devuelto por Azurite>
```

El tipo de contenido mostrado depende de la propiedad asignada al blob durante
la carga. La fecha y el ETag también son valores administrados por Azurite.

## Qué no hace este ejercicio

El script no:

- lee el JSON desde el disco del proyecto;
- descarga el contenido almacenado en Azurite;
- crea el blob container `raw`;
- carga, reemplaza ni modifica el contenido del JSON;
- descarga datos desde CMS;
- se conecta a Azure en la nube.

El script **sí modifica la metadata definida por el usuario** mediante
`set_blob_metadata()`.

Al terminar, se habrá comprobado esta separación:

```text
listar y consultar propiedades = preguntar por los objetos
descargar el blob              = leer el contenido del objeto
```
