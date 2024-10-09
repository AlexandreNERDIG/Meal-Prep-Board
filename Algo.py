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