# Computer Graphics

Aplicacion implementada en three.js. Consiste en un escenario donde se pueden generar piezas a partir de una impresa, moverlas utilizando un elevador controlado por teclado y almacenarlas en una estanteria.

## Ejecucion

Para utilizar la aplicacion basta con acceder al index.html. 

Para esto se puede acceder a un [deploy online](https://cg.isagues.ar), usar el navegador habilitando archivos locales o usando el [modulo http de python](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server#running_a_simple_local_http_server).

## Uso

La aplicacion permite principalmente analizar el ambiente haciendo uso de las camaras. Desplazar el elevador por el escenario. Generar distintas piezas con la impresora y su menu de opciones. Y almacenar la piezas en las estantria.

### Controles

- A, D: girar a izquierda o derecha 
- W, S: avanzar o retroceder
- Q, E: subir o bajar pala
- G: tomar un objeto 3D de la impresora o dejarlo en un casillero libre de la estantería
- O, P: zoom de las camaras orbitales.
- 1, 2, 3: Camaras orbitales
- 4, 5, 6: Camaras del elevador
- Mouse: Hacer paneos con la camara 

### Generacion de las piezas

Para la generacion de las piezas se ofrece un menu. Este permite seleccionar el tipo de pieza, configurar distintas propiedades de la misma y por ultimo generarla. Utilizando el boton de **render**.

### Aclaraciones

Para que se pueda agarrar o soltar una pieza hay que estar cerca deel lugar objetivo, solo ahi funcionara la tecla.