# Docker y Storage Explorer: Azurite con persistencia

Esta guía registra el primer ejercicio práctico de Docker realizado para este proyecto. Su objetivo es explicar cómo descargar una imagen, crear almacenamiento persistente, levantar un contenedor y comprobar que el servicio funciona.

## Entorno validado

Estado comprobado el 6 de septiembre de 2026:

- Docker Desktop 4.69.0 (build 224084)
- Docker Engine y Docker CLI 29.4.0
- Docker Compose 5.1.1
- Docker Buildx 0.33.0
- backend WSL 2
- Microsoft Azure Storage Explorer 1.45.0
- Docker AI y las funciones beta desactivados por compatibilidad con Windows build 26200

La instalación fue validada correctamente con la imagen `hello-world`.

## Conceptos antes de comenzar

Una **imagen** es una plantilla de solo lectura que contiene una aplicación y lo necesario para ejecutarla.

Un **contenedor** es una instancia creada a partir de una imagen. Puede estar ejecutándose o detenido.

Un **volumen** es almacenamiento administrado por Docker. Sus datos pueden sobrevivir aunque eliminemos el contenedor que los utilizaba.

**Microsoft Azure Storage Explorer** es una aplicación gráfica que permite conectarse a Azurite y administrar el almacenamiento sin escribir cada solicitud HTTP manualmente. Storage Explorer no almacena los blobs: funciona como una ventana para ver y manipular lo que Azurite guarda en el volumen.

Un **blob container** es una agrupación lógica de blobs dentro de una cuenta de almacenamiento. No es lo mismo que un contenedor de Docker.

```text
Registro en Internet --docker pull--> Imagen local --docker run--> Contenedor
                                                               |
                                                               v
                                                         Volumen persistente
```

Una misma imagen puede utilizarse para crear varios contenedores. Descargar una imagen no crea ni inicia automáticamente un contenedor.

## Antes del ejercicio: comprobar Docker

```powershell
# Muestra si Docker Desktop está iniciado.
docker desktop status

# Muestra las versiones del cliente y del servidor (daemon).
docker version
```

Docker tiene dos partes importantes:

- el **cliente** recibe el comando escrito en la terminal;
- el **daemon** o servidor realiza el trabajo con imágenes, volúmenes y contenedores.

Si el cliente no puede comunicarse con el daemon, los comandos muestran un error de conexión al motor de Docker.

## Paso 1: descargar la imagen oficial

En PowerShell:

```powershell
# Descarga la imagen oficial de Azurite desde Microsoft Container Registry.
docker pull mcr.microsoft.com/azure-storage/azurite
```

Esto descarga la **imagen** de Azurite a la computadora. Microsoft publica oficialmente esta imagen, tal como se indica en la [documentación de instalación de Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-install-azurite#install-azurite).

El nombre se puede leer de esta manera:

```text
mcr.microsoft.com / azure-storage / azurite
registro            colección       imagen
```

Como no indicamos una etiqueta, Docker utiliza `latest` automáticamente.

Durante la descarga aparecen mensajes como estos:

```text
Downloading       Docker está descargando una capa.
Extracting        Docker está descomprimiendo esa capa.
Pull complete     La capa quedó almacenada localmente.
```

Las capas permiten que Docker reutilice contenido compartido entre imágenes. Ejecutar el mismo `docker pull` otra vez no crea una copia duplicada. Si el contenido no cambió, Docker responde:

```text
Status: Image is up to date
```

Cuando termine, verifica:

```powershell
# Muestra las imágenes almacenadas localmente.
docker images
```

Deberías encontrar una fila parecida a esta:

```text
mcr.microsoft.com/azure-storage/azurite   latest
```

Resultado observado durante este ejercicio:

```text
Imagen:        mcr.microsoft.com/azure-storage/azurite:latest
Image ID:      54a90e14c290
Digest:        sha256:830430c1da1a2d537e08f3e6764dd1f5ae00cf0346bcaf625b968ec3f0971fd5
Sistema:       linux/amd64
Capas:         10
Tamaño:        348,084,856 bytes (aproximadamente 348 MB)
```

El **Image ID** identifica el contenido almacenado localmente. El **digest** identifica de forma precisa el contenido publicado en el registro.

Este paso ya fue completado.

## Paso 2: crear un volumen

Queremos que los blobs sobrevivan aunque destruyamos y volvamos a crear el contenedor.

Ejecuta:

```powershell
# Crea un volumen administrado por Docker.
docker volume create healthcare_azurite_data
```

Docker debería responder con el nombre:

```text
healthcare_azurite_data
```

Después comprueba que existe:

```powershell
# Lista todos los volúmenes disponibles.
docker volume ls
```

Debería aparecer:

```text
healthcare_azurite_data
```

Esto será la persistencia local de Azurite. El volumen no es una carpeta del repositorio y no se guarda en Git; Docker lo almacena dentro de su disco virtual.

## Paso 3: levantar Azurite Blob Storage

Ejecuta el siguiente comando completo en PowerShell:

```powershell
# Crea e inicia un contenedor de Azurite en segundo plano.
docker run -d `
  --name healthcare-azurite `
  -p 127.0.0.1:10000:10000 `
  -v healthcare_azurite_data:/data `
  mcr.microsoft.com/azure-storage/azurite `
  azurite-blob `
  --blobHost 0.0.0.0 `
  --blobPort 10000 `
  --location /data
```

La [documentación oficial para ejecutar Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-install-azurite#run-the-azurite-docker-image) confirma que Blob Storage utiliza por defecto el puerto `10000`, que puede iniciarse por separado con `azurite-blob` y que Azurite admite una ubicación persistente.

### Qué significa cada parte

`docker run` crea y ejecuta un contenedor usando una imagen.

`-d` significa *detached*: deja el contenedor ejecutándose en segundo plano y devuelve el control de la terminal.

`--name healthcare-azurite` asigna un nombre humano al contenedor para no tener que utilizar su identificador hexadecimal.

`-p 127.0.0.1:10000:10000` publica y conecta el puerto:

```text
Windows 127.0.0.1:10000
           |
           v
   contenedor:10000
```

El número de la izquierda pertenece a Windows. El de la derecha pertenece al contenedor.

La dirección `127.0.0.1` limita el acceso al propio equipo. La variante `-p 10000:10000` publicaría el puerto en todas las interfaces de Windows; no la necesitamos para este entorno local de aprendizaje.

`-v healthcare_azurite_data:/data` conecta el volumen persistente con la ruta `/data` dentro del contenedor:

```text
volumen healthcare_azurite_data
              |
              v
      /data en el contenedor
```

`mcr.microsoft.com/azure-storage/azurite` es la imagen que Docker utilizará para crear el contenedor.

`azurite-blob` indica que se ejecute solamente Blob Storage. En este ejercicio no iniciamos Queue Storage ni Table Storage porque todavía no los necesitamos.

`--blobHost 0.0.0.0` hace que el proceso escuche en todas las interfaces **dentro del contenedor**. Esto permite que la publicación de puertos de Docker pueda dirigir las solicitudes hacia Azurite.

`--blobPort 10000` indica que el servicio Blob escuchará en el puerto `10000` dentro del contenedor.

`--location /data` indica dónde debe persistir Azurite sus archivos. Como `/data` está conectado al volumen, los datos no dependen de la vida del contenedor.

El carácter de PowerShell `` ` `` permite continuar un comando en la línea siguiente. No debe haber espacios después de ese carácter.

## Paso 4: comprobar que Azurite está vivo

Ejecuta:

```powershell
# Muestra solamente los contenedores que están ejecutándose.
docker ps
```

Resultado real obtenido:

```text
Nombre=healthcare-azurite
Estado=Up
Puertos=127.0.0.1:10000->10000/tcp
```

Después consulta la salida del servicio:

```powershell
# Muestra los mensajes escritos por Azurite dentro del contenedor.
docker logs healthcare-azurite
```

Resultado real obtenido:

```text
Azurite Blob service is starting on 0.0.0.0:10000
Azurite Blob service successfully listens on http://0.0.0.0:10000
```

El endpoint local será:

```text
http://127.0.0.1:10000
```

La conexión TCP desde Windows también fue comprobada con resultado positivo. Azurite es una API de almacenamiento, no una página web: abrir el endpoint directamente en un navegador puede mostrar un mensaje XML de autenticación o solicitud inválida. Esa respuesta no significa necesariamente que el servicio esté caído.

En el estilo de URL basado en rutas, el nombre de la cuenta aparece después del puerto:

```text
http://127.0.0.1:10000/<cuenta>/<contenedor-blob>/<blob>
```

`contenedor-blob` se refiere aquí a un **blob container de Azure Storage**, no al contenedor de Docker. Son dos conceptos distintos que comparten la palabra “contenedor”.

## Qué construimos

Después de completar los cuatro pasos, la estructura local es:

```text
Windows
   |
   v
Docker Desktop
   |
   v
contenedor Docker: healthcare-azurite
   |                         |
   v                         v
puerto 10000       volumen: healthcare_azurite_data
                             |
                             v
                         datos Blob
```

## Paso 5: instalar Microsoft Azure Storage Explorer

La aplicación se instaló desde el catálogo de Windows con:

```powershell
# Instala exactamente el paquete oficial de Microsoft.
winget install `
  --id Microsoft.Azure.StorageExplorer `
  --exact `
  --source winget `
  --accept-source-agreements `
  --accept-package-agreements
```

Significado de las partes principales:

- `winget install` solicita a Windows que instale un programa.
- `--id Microsoft.Azure.StorageExplorer` selecciona el paquete de Storage Explorer.
- `--exact` evita seleccionar otro paquete con un nombre parecido.
- `--source winget` utiliza el catálogo configurado de Windows.

La instalación se verificó con:

```powershell
# Consulta el paquete instalado y su versión.
winget list --id Microsoft.Azure.StorageExplorer --exact
```

Resultado validado:

```text
Microsoft Azure Storage Explorer 1.45.0
```

Microsoft publica la aplicación en la [página oficial de Azure Storage Explorer](https://azure.microsoft.com/en-us/products/storage/storage-explorer/).

## Paso 6: conectar Storage Explorer con Azurite

Azurite debe estar iniciado antes de abrir la conexión. Storage Explorer no inicia el emulador automáticamente.

En Storage Explorer se siguió este recorrido:

1. abrir **Conectar a Azure Storage**;
2. seleccionar **Emulador de almacenamiento local**;
3. completar la conexión;
4. revisar el resumen;
5. seleccionar **Conectar**.

Configuración utilizada:

```text
Nombre para mostrar: healthcare-azurite-local
Nombre de cuenta:    devstoreaccount1
Puerto de blobs:     10000
Puerto de archivos:  vacío
Puerto de colas:     vacío
Puerto de tablas:    vacío
Usar HTTPS:          no
```

`devstoreaccount1` es la cuenta de desarrollo predeterminada de Azurite. Storage Explorer completa su clave local conocida; no corresponde a una credencial de Azure real.

Los puertos de archivos, colas y tablas se dejaron vacíos porque este ejercicio inició únicamente `azurite-blob`. El punto de conexión resultante fue:

```text
http://127.0.0.1:10000/devstoreaccount1
```

La conexión apareció en el árbol de recursos como:

```text
Emulador y adjunto
└── Cuentas de almacenamiento
    └── healthcare-azurite-local (Key)
```

Microsoft documenta este procedimiento en [Conectar un emulador a Storage Explorer](https://learn.microsoft.com/es-es/azure/storage/common/storage-explorer-emulators).

## Paso 7: crear el blob container `raw`

Dentro de la conexión `healthcare-azurite-local`:

1. expandir **Contenedores de blobs**;
2. hacer clic derecho sobre ese nodo;
3. seleccionar **Crear contenedor de blobs**;
4. escribir `raw` en minúsculas;
5. presionar `Enter`.

El nombre `raw` indica que allí se guardan datos tal como llegaron de la fuente, antes de limpiarlos o transformarlos.

Los logs confirmaron la creación:

```text
PUT /devstoreaccount1/raw?restype=container HTTP/1.1 201
GET /devstoreaccount1/raw?restype=container HTTP/1.1 200
```

- `PUT` con código `201` significa que el recurso fue creado.
- `GET` con código `200` significa que Azurite pudo encontrarlo y devolverlo.

Este `raw` es un **blob container de Azure Storage**. El proceso `healthcare-azurite` continúa siendo el **contenedor de Docker**. Son niveles distintos.

## Paso 8: cargar el primer blob

Se abrió el blob container `raw` y se seleccionó **Cargar > Cargar archivos**.

Archivo de origen local:

```text
data/raw/medicare_inpatient_2024.json
```

Opciones utilizadas:

```text
Tipo de blob:         Blob en bloques
Nivel de acceso:      Predeterminado
Directorio de destino: /
```

`/` significa que el archivo se guarda directamente en la raíz lógica de `raw`:

```text
raw/
└── medicare_inpatient_2024.json
```

Storage Explorer dividió el archivo en bloques, cargó cada bloque y finalmente confirmó la lista completa de bloques. Los logs mostraron:

```text
HEAD .../raw/medicare_inpatient_2024.json HTTP/1.1 404
PUT  .../raw/medicare_inpatient_2024.json?comp=block HTTP/1.1 201
PUT  .../raw/medicare_inpatient_2024.json?comp=blocklist HTTP/1.1 201
HEAD .../raw/medicare_inpatient_2024.json HTTP/1.1 200
```

Interpretación:

- el primer `404` confirmó que el blob todavía no existía;
- cada `201` confirmó que un bloque o la lista final se guardó correctamente;
- el `200` final confirmó que el blob completo ya podía consultarse.

Resultado validado:

```text
Blob:    raw/medicare_inpatient_2024.json
Tamaño:  101,964,930 bytes (aproximadamente 97.24 MiB)
Estado:  cargado correctamente
```

La carga fue completamente local: Storage Explorer envió el archivo a `127.0.0.1:10000`, Azurite lo procesó y el volumen `healthcare_azurite_data` conservó los datos. No se cargó el archivo a una cuenta de Azure en la nube.

## Comandos básicos para administrarlo

```powershell
# Comprueba los contenedores activos.
docker ps

# Comprueba también los contenedores detenidos.
docker ps -a

# Detiene Azurite sin eliminar el contenedor ni el volumen.
docker stop healthcare-azurite

# Vuelve a iniciar el mismo contenedor.
docker start healthcare-azurite

# Consulta nuevamente sus mensajes.
docker logs healthcare-azurite
```

Eliminar el contenedor y eliminar el volumen son acciones diferentes:

```powershell
# Elimina el contenedor después de detenerlo.
# El volumen healthcare_azurite_data permanece disponible.
docker rm healthcare-azurite

# PRECAUCIÓN: este comando elimina el volumen y los blobs almacenados en él.
# No debe ejecutarse si se quieren conservar los datos.
docker volume rm healthcare_azurite_data
```

## Estado del aprendizaje

- Paso 1, descargar e inspeccionar la imagen: **completado**.
- Paso 2, crear el volumen `healthcare_azurite_data`: **completado**.
- Paso 3, levantar el contenedor `healthcare-azurite`: **completado**.
- Paso 4, comprobar el servicio, los logs, el montaje y el puerto: **completado**.
- Paso 5, instalar Microsoft Azure Storage Explorer 1.45.0: **completado**.
- Paso 6, conectar Storage Explorer al emulador local: **completado**.
- Paso 7, crear el blob container `raw`: **completado**.
- Paso 8, cargar y verificar `medicare_inpatient_2024.json`: **completado**.

Estado actual registrado:

```text
Imagen:       mcr.microsoft.com/azure-storage/azurite:latest
Contenedor:   healthcare-azurite (activo)
Puerto local: http://127.0.0.1:10000
Volumen:      healthcare_azurite_data -> /data
Servicio:     Blob Storage únicamente
Conexión GUI: healthcare-azurite-local
Blob container: raw
Primer blob: raw/medicare_inpatient_2024.json
```
