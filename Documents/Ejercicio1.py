juegos = {
    'A123': ['FIFA 24', 'PS5', 'Deportes', 10],
    'B456': ['Mario Kart 8', 'Switch', 'Carreras', 3],
    'C789': ['The Last of Us II', 'PS5', 'Acción', 18],
    'D321': ['Zelda BOTW', 'Switch', 'Aventura', 12],
    'E654': ['Minecraft', 'PC', 'Creativo', 6]
}

ventas = {
    'A123': [49990, 15],
    'B456': [39990, 10],
    'C789': [59990, 5],
    'D321': [54990, 0],
    'E654': [19990, 25]
}

def buscar_por_consola(consola):
    total = 0
    for codigo,datos in juegos.items():
        if datos[1].lower() == consola.lower() and codigo in ventas:
            total = total + ventas[codigo][1]
    print(f"Existen {total} unidades de la {consola}")

    
def juegos_por_edad(min_edad, max_edad):
    resultado =[]
    for codigo,datos in juegos.items():
        edad = datos[3]
        if min_edad <= edad and edad <= max_edad and ventas[codigo][1] > 0:
            resultado.append(datos[0])
    if resultado:
        print(resultado)
    else:
        print("No hay juegos en ese rango de edad")    

def actualizar_precio(codigo, nuevo_precio):
    if codigo in ventas:
        ventas[codigo][0] = nuevo_precio
        return True
    return False

while True:
    try:
        print("**** MENU GAME ZONE******")
        print("1. Buscar por consola")
        print("2. Juegos por rango de edad")
        print("3. Actualizar precio de juego")
        print("4. Salir")
        opc = int(input("Ingrese opción: "))

        if opc == 1:
            consola = input("Ingrese consola(PS5,Switch,PC): ")
            buscar_por_consola(consola)
        elif opc == 2:
            while True:
                try:
                    min_edad = int(input("Ingrese edad mínima: "))
                    max_edad = int(input("Ingrese edad máxima: "))
                    break
                except ValueError:
                    print("Debe ingresar datos enteros!")
            juegos_por_edad(min_edad, max_edad)
        elif opc == 3:
            codigo = input("Ingrese código del juego: ")
            try:
                nuevo_precio = int(input("Ingrese nuevo precio: "))
            except ValueError:
                print("Debe ingresar un número!")
            if actualizar_precio(codigo, nuevo_precio):
                print("Precio actualizado!!")
            else:
                print("Código no encontrado!!")
        elif opc == 4:
            print("Programa finalizado")
            #print(ventas)
            break
        else:
            print("Opción no válida!!")
    except ValueError:
        print("Debe ingresar un número")

    

