def TriDico(STR):
    TAB = []
    mot = ""
    for i in range(len(STR)):
        if STR[i] == " ":
            TAB.append(mot)
            mot = ""
        else:
            mot += STR[i]
    if (len(mot) > 0):
        TAB.append(mot)
    return (TAB)

a = "J'adore manger des pommes de terres"
print(TriDico(a))


def calculer_imc(poids, taille):
    if taille == 0:
        return "La taille ne peut pas être nulle."
    imc = poids / (taille ** 2)
    
    if imc < 18.5:
        return f"IMC = {imc:.2f}: Sous-poids"
    elif 18.5 <= imc <= 24.9:
        return f"IMC = {imc:.2f}: Poids normal"
    elif 25 <= imc <= 29.9:
        return f"IMC = {imc:.2f}: Surpoids"
    else:
        return f"IMC = {imc:.2f}: Obèse"

# Exemple d'utilisation
poids = 70  # en kg
taille = 1.75  # en mètres
resultat_imc = calculer_imc(poids, taille)
print(resultat_imc)