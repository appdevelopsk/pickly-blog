#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, os, re

BASE = "/tmp/pickly-deploy/site/src/articles/best-electric-grill-2026/messages"

HB = "Hamilton Beach 25361"   # replaces Zojirushi EB-DLC20
G1 = "Gas One GS-3000"        # replaces Iwatani CB-P-Y3

# Per-locale fully-translated content for the two replaced products.
# Fields: hb_offernote, g1_offernote, hb_badge, hb_review, hb_pros[3], hb_cons[1],
#         hb_specs(dict), g1_badge, g1_review, g1_pros[3], g1_cons[1], g1_specs(dict),
#         hb_rec_label, hb_rec_reason, g1_rec_reason,
#         spec keys per locale (we look them up from existing file dynamically).
L = {}

L["de"] = dict(
 hb_offernote="Elektrischer Indoor-Searing-Grill — verstellbares Thermostat bis ca. 230°C, fettableitendes Design, abnehmbare Grillplatte, Deckel und Auffangschale sind alle spülmaschinenfest. Am besten für tägliches Grillen zu Hause mit einfacher Reinigung. Rauchunterdrückung funktioniert bei magerem Protein, nicht bei fetthaltigen Stücken bei hoher Hitze.",
 g1_offernote="Tragbarer Butan-Grillkocher — hohe direkte Hitze, vollständig tragbar ohne Stromkabel, läuft mit handelsüblichen Butankartuschen. Am besten für Balkon- oder Außeneinsatz, wo keine Steckdose vorhanden ist. Einstufung als offene Flamme kann mit Hausordnungen in Konflikt geraten; Kartuschenkosten verursachen laufende Ausgaben.",
 hb_badge="Bestes für einfach zu reinigendes Indoor-Grillen",
 hb_review="Das herausragende Merkmal des Hamilton Beach 25361 ist, dass Grillplatte, Deckel und Auffangschale alle abnehmbar sind und direkt in die Spülmaschine wandern — die einfachste Maschinenreinigung der Elektrogeräte hier. Das verstellbare Thermostat erreicht rund 230°C, heiß genug für echtes Anbraten, und gibt dir direkte Kontrolle statt einer festen Voreinstellung. Das fettableitende Design liefert echte raucharme Ergebnisse bei magerem Protein in der Wohnungsbelüftung. Das Gegenstück zu einem schwereren Flaggschiff ist eine dünnere Antihaftplatte, die beim Hinzufügen kalter Speisen etwas schneller an Temperatur verliert — arbeite daher bei fetthaltigen Stücken in kleineren Portionen.",
 hb_pros=["Grillplatte, Deckel und Auffangschale sind alle abnehmbar und spülmaschinenfest — einfachste Reinigung hier","Verstellbares Thermostat bis ca. 230°C gibt direkte Kontrolle über die Anbrattemperatur","Fettableitendes Design hält Rauch bei magerem Protein in der Wohnungsbelüftung niedrig"],
 hb_cons=["Dünnere Antihaftplatte verliert beim Hinzufügen kalter Speisen schneller Temperatur"],
 hb_specs={"Leistung":"ca. 1200 W","Plattentyp":"Antihaft, abnehmbar","Rauchreduzierung":"Fettableitschale","Reinigung":"Platte, Deckel und Schale spülmaschinenfest","Temperatur":"Verstellbares Thermostat bis ca. 230°C","Grillfläche":"ca. 760 cm²","Preis":"Mittelklasse"},
 g1_badge="Bestes für Balkon oder Außengrillen",
 g1_review="Der einzelne Butanbrenner des Gas One GS-3000 liefert hohe direkte Hitze mit dem Tragbarkeitsvorteil ohne Stromkabel und enthält eine Tragetasche sowie eine automatische Zündung. Für Balkongrillen, wo der Stromzugang begrenzt ist und die Offenfeuerbeschränkung der Gebäuderegeln nicht zutrifft, ist es die natürliche Wahl. Die praktischen Einschränkungen für den Wohnungsbetrieb sind real: Kartuschenkosten addieren sich bei häufigem Einsatz, die Kartuschen müssen sicher gelagert werden, und Hausordnungen beschränken in der Regel Offenfeuergeräte auf Balkons.",
 g1_pros=["Hohe direkte Hitze von einem einzelnen Butanbrenner erreicht echte Anbrattemperaturen","Vollständig tragbar ohne Stromkabel, plus Tragetasche — nutzbar am Tisch oder draußen","Automatische Zündung und handelsübliche Butankartuschen machen den Aufbau überall einfach"],
 g1_cons=["Offenfeuer-Einstufung kann Wohnungshausordnungen verletzen"],
 g1_specs={"Waermequelle":"Butangas (Einzelbrenner)","Zuendung":"Automatischer Druckknopf","Rauchreduzierung":"Abtropfkanal unter der Grillplatte","Reinigung":"Abnehmbare Antihaftplatte abwischbar; Brennerkörper abwischen","Tragbarkeit":"Tragetasche enthalten","Brennstoff":"Handelsübliche Butankartusche"},
 hb_rec_label="Tägliches Indoor-Grillen mit der einfachsten Reinigung",
 hb_rec_reason="Grillplatte, Deckel und Auffangschale sind alle spülmaschinenfest, und das verstellbare Thermostat erreicht eine echte Anbrattemperatur — die aufwandärmste Elektro-Option hier für magere Stücke in Wohnungsbedingungen.",
 g1_rec_reason="Tragbar ohne Stromkabel, mit Tragetasche und hoher direkter Butanhitze — natürliche Wahl für Außen- oder Balkoneinsatz, wo Strom ungünstig ist.",
)

L["fr"] = dict(
 hb_offernote="Gril électrique d'intérieur à saisir — thermostat réglable jusqu'à environ 230°C, conception d'égouttage des graisses, plaque, couvercle et bac récupérateur amovibles et tous lavables au lave-vaisselle. Idéal pour griller au quotidien avec un nettoyage facile. La réduction de fumée fonctionne sur les protéines maigres mais pas sur les pièces grasses à haute température.",
 g1_offernote="Réchaud-gril à butane portable — forte chaleur directe, entièrement portable sans cordon, fonctionne avec des cartouches de butane standard. Idéal pour le balcon ou l'extérieur où l'électricité n'est pas disponible. La classification flamme nue peut entrer en conflit avec le règlement de l'immeuble ; le coût des cartouches ajoute une dépense continue.",
 hb_badge="Meilleur pour un grillage d'intérieur facile à nettoyer",
 hb_review="L'atout du Hamilton Beach 25361 est que la plaque de gril, le couvercle et le bac récupérateur se détachent tous et passent directement au lave-vaisselle — le nettoyage en machine le plus facile parmi les appareils électriques ici. Le thermostat réglable atteint environ 230°C, assez chaud pour une vraie saisie, et vous donne un contrôle direct plutôt qu'un préréglage fixe. La conception d'égouttage des graisses produit de vrais résultats à faible fumée avec les protéines maigres dans une ventilation d'appartement. Le compromis face à un modèle haut de gamme plus lourd est une plaque antiadhésive plus fine qui perd un peu plus vite en température quand on ajoute des aliments froids — travaillez donc en plus petites portions pour les pièces grasses.",
 hb_pros=["Plaque, couvercle et bac récupérateur sont tous amovibles et lavables au lave-vaisselle — nettoyage le plus facile ici","Thermostat réglable jusqu'à environ 230°C pour un contrôle direct de la température de saisie","La conception d'égouttage maintient la fumée basse avec les protéines maigres en ventilation d'appartement"],
 hb_cons=["La plaque antiadhésive plus fine perd plus vite en température quand on ajoute des aliments froids"],
 hb_specs={"Puissance":"env. 1200 W","Type de plaque":"Antiadhésive, amovible","Réduction de fumée":"Bac d'égouttage des graisses","Nettoyage":"Plaque, couvercle et bac lavables au lave-vaisselle","Température":"Thermostat réglable jusqu'à env. 230°C","Surface de cuisson":"env. 760 cm²","Prix":"Milieu de gamme"},
 g1_badge="Meilleur pour le balcon ou le grillage en extérieur",
 g1_review="Le brûleur butane unique du Gas One GS-3000 délivre une forte chaleur directe avec l'avantage de la portabilité sans cordon, et il comprend une mallette de transport et un allumage automatique. Pour griller sur un balcon où l'accès à l'électricité est limité et où la restriction flamme nue du règlement ne s'applique pas, c'est le choix naturel. Les limites pratiques pour un usage intérieur en appartement sont réelles : le coût des cartouches s'accumule avec un usage fréquent, les cartouches doivent être stockées en sécurité, et les règlements d'immeuble restreignent souvent les appareils à flamme nue sur les balcons.",
 g1_pros=["Forte chaleur directe d'un brûleur butane unique atteignant de vraies températures de saisie","Entièrement portable sans cordon, avec mallette de transport — utilisable à table ou en extérieur","Allumage automatique et cartouches de butane standard facilitent l'installation partout"],
 g1_cons=["La classification flamme nue peut enfreindre le règlement de l'immeuble"],
 g1_specs={"Source de chaleur":"Gaz butane (brûleur unique)","Allumage":"Bouton-poussoir automatique","Réduction de fumée":"Canal d'égouttage sous la plaque de gril","Nettoyage":"Plaque antiadhésive amovible essuyable ; essuyer le corps du brûleur","Portabilité":"Mallette de transport incluse","Carburant":"Cartouche de butane standard"},
 hb_rec_label="Grillage d'intérieur quotidien avec le nettoyage le plus facile",
 hb_rec_reason="La plaque, le couvercle et le bac récupérateur passent tous au lave-vaisselle, et le thermostat réglable atteint une vraie température de saisie — l'option électrique la moins contraignante ici pour les pièces maigres en appartement.",
 g1_rec_reason="Portable sans cordon, avec mallette de transport et forte chaleur directe au butane — le choix naturel pour l'extérieur ou le balcon où l'électricité est peu pratique.",
)

L["es"] = dict(
 hb_offernote="Parrilla eléctrica de interior para sellar — termostato ajustable hasta unos 230°C, diseño de drenaje de grasa, placa, tapa y bandeja recogegotes extraíbles y todas aptas para lavavajillas. Ideal para asar a diario en casa con limpieza fácil. La reducción de humo funciona con proteína magra, pero no con cortes grasos a alta temperatura.",
 g1_offernote="Hornillo-parrilla de butano portátil — calor directo alto, totalmente portátil sin cable, funciona con cartuchos de butano estándar. Ideal para balcón o exterior donde no hay electricidad. La clasificación de llama abierta puede entrar en conflicto con el reglamento del edificio; el coste de los cartuchos añade un gasto continuo.",
 hb_badge="Mejor para asar en interior con limpieza fácil",
 hb_review="Lo más destacado del Hamilton Beach 25361 es que la placa, la tapa y la bandeja recogegotes se desmontan y van directamente al lavavajillas — la limpieza en máquina más fácil de los eléctricos aquí. El termostato ajustable alcanza unos 230°C, suficiente para un sellado real, y te da control directo en lugar de un ajuste fijo. El diseño de drenaje de grasa produce resultados de bajo humo reales con proteína magra en la ventilación de un apartamento. La contrapartida frente a un modelo más pesado es una placa antiadherente más fina que pierde temperatura algo más rápido al añadir alimentos fríos — trabaja en tandas más pequeñas con cortes grasos.",
 hb_pros=["Placa, tapa y bandeja recogegotes son todas extraíbles y aptas para lavavajillas — la limpieza más fácil aquí","Termostato ajustable hasta unos 230°C para control directo de la temperatura de sellado","El diseño de drenaje mantiene bajo el humo con proteína magra en ventilación de apartamento"],
 hb_cons=["La placa antiadherente más fina pierde temperatura más rápido al añadir alimentos fríos"],
 hb_specs={"Potencia":"aprox. 1200 W","Tipo de placa":"Antiadherente, extraíble","Reducción de humo":"Bandeja de drenaje de grasa","Limpieza":"Placa, tapa y bandeja aptas para lavavajillas","Temperatura":"Termostato ajustable hasta aprox. 230°C","Superficie de cocción":"aprox. 760 cm²","Precio":"Gama media"},
 g1_badge="Mejor para balcón o asado al aire libre",
 g1_review="El quemador único de butano del Gas One GS-3000 entrega calor directo alto con la ventaja de la portabilidad sin cable, e incluye un maletín de transporte y encendido automático. Para asar en un balcón donde el acceso a la electricidad es limitado y la restricción de llama abierta del reglamento no aplica, es la opción natural. Las limitaciones prácticas para uso interior en apartamento son reales: el coste de los cartuchos se acumula con uso frecuente, los cartuchos deben almacenarse con seguridad, y los reglamentos suelen restringir los aparatos de llama abierta en los balcones.",
 g1_pros=["Calor directo alto de un solo quemador de butano que alcanza temperaturas de sellado reales","Totalmente portátil sin cable, con maletín de transporte — usable en la mesa o al aire libre","Encendido automático y cartuchos de butano estándar facilitan el montaje en cualquier lugar"],
 g1_cons=["La clasificación de llama abierta puede infringir el reglamento del edificio"],
 g1_specs={"Fuente de calor":"Gas butano (quemador único)","Encendido":"Botón pulsador automático","Reducción de humo":"Canal de drenaje bajo la placa","Limpieza":"Placa antiadherente extraíble se limpia con un paño; limpiar el cuerpo del quemador","Portabilidad":"Maletín de transporte incluido","Combustible":"Cartucho de butano estándar"},
 hb_rec_label="Asado de interior diario con la limpieza más fácil",
 hb_rec_reason="La placa, la tapa y la bandeja recogegotes son aptas para lavavajillas, y el termostato ajustable alcanza una temperatura de sellado real — la opción eléctrica de menor esfuerzo aquí para cortes magros en condiciones de apartamento.",
 g1_rec_reason="Portátil sin cable, con maletín de transporte y calor directo alto de butano — la opción natural para exterior o balcón donde la electricidad es incómoda.",
)

# Romance/other locales reuse English-ish brand handling; we provide translations for it, pt-BR, id, vi, tr, ru, ko, ar, hi, th, zh-CN, zh-TW below.

L["it"] = dict(
 hb_offernote="Griglia elettrica da interno per scottare — termostato regolabile fino a circa 230°C, design di drenaggio del grasso, piastra, coperchio e vassoio raccogligocce removibili e tutti lavabili in lavastoviglie. Ideale per grigliare ogni giorno a casa con pulizia facile. La riduzione del fumo funziona con proteine magre, ma non con tagli grassi ad alta temperatura.",
 g1_offernote="Fornello-griglia a butano portatile — alto calore diretto, completamente portatile senza cavo, funziona con cartucce di butano standard. Ideale per balcone o esterno dove non c'è elettricità. La classificazione a fiamma libera può entrare in conflitto con il regolamento condominiale; il costo delle cartucce aggiunge una spesa continua.",
 hb_badge="Migliore per grigliare in interni con pulizia facile",
 hb_review="Il punto di forza dell'Hamilton Beach 25361 è che piastra, coperchio e vassoio raccogligocce si staccano tutti e vanno direttamente in lavastoviglie — la pulizia in macchina più facile tra gli elettrici qui. Il termostato regolabile raggiunge circa 230°C, abbastanza caldo per una vera scottatura, e ti dà il controllo diretto invece di una preimpostazione fissa. Il design di drenaggio del grasso produce risultati a basso fumo reali con proteine magre nella ventilazione di un appartamento. Il compromesso rispetto a un modello più pesante è una piastra antiaderente più sottile che perde temperatura un po' più velocemente quando si aggiungono cibi freddi — lavora quindi in porzioni più piccole per i tagli grassi.",
 hb_pros=["Piastra, coperchio e vassoio raccogligocce sono tutti removibili e lavabili in lavastoviglie — la pulizia più facile qui","Termostato regolabile fino a circa 230°C per il controllo diretto della temperatura di scottatura","Il design di drenaggio mantiene basso il fumo con proteine magre nella ventilazione di un appartamento"],
 hb_cons=["La piastra antiaderente più sottile perde temperatura più velocemente quando si aggiungono cibi freddi"],
 hb_specs={"Potenza":"circa 1200 W","Tipo di piastra":"Antiaderente, removibile","Riduzione del fumo":"Vassoio di drenaggio del grasso","Pulizia":"Piastra, coperchio e vassoio lavabili in lavastoviglie","Temperatura":"Termostato regolabile fino a circa 230°C","Superficie di cottura":"circa 760 cm²","Prezzo":"Fascia media"},
 g1_badge="Migliore per balcone o grigliate all'aperto",
 g1_review="Il bruciatore singolo a butano del Gas One GS-3000 eroga alto calore diretto con il vantaggio della portabilità senza cavo, e include una valigetta di trasporto e un'accensione automatica. Per grigliare su un balcone dove l'accesso all'elettricità è limitato e la restrizione sulla fiamma libera del regolamento non si applica, è la scelta naturale. I limiti pratici per l'uso interno in appartamento sono reali: il costo delle cartucce si accumula con l'uso frequente, le cartucce devono essere conservate in sicurezza, e i regolamenti spesso limitano i dispositivi a fiamma libera sui balconi.",
 g1_pros=["Alto calore diretto da un singolo bruciatore a butano che raggiunge vere temperature di scottatura","Completamente portatile senza cavo, con valigetta di trasporto — utilizzabile a tavola o all'aperto","Accensione automatica e cartucce di butano standard rendono facile l'installazione ovunque"],
 g1_cons=["La classificazione a fiamma libera può violare il regolamento condominiale"],
 g1_specs={"Fonte di calore":"Gas butano (bruciatore singolo)","Accensione":"Pulsante automatico","Riduzione del fumo":"Canale di drenaggio sotto la piastra","Pulizia":"Piastra antiaderente removibile da pulire con un panno; pulire il corpo del bruciatore","Portabilità":"Valigetta di trasporto inclusa","Combustibile":"Cartuccia di butano standard"},
 hb_rec_label="Grigliate in interni quotidiane con la pulizia più facile",
 hb_rec_reason="Piastra, coperchio e vassoio raccogligocce sono lavabili in lavastoviglie, e il termostato regolabile raggiunge una vera temperatura di scottatura — l'opzione elettrica meno impegnativa qui per tagli magri in condizioni di appartamento.",
 g1_rec_reason="Portatile senza cavo, con valigetta di trasporto e alto calore diretto a butano — la scelta naturale per esterno o balcone dove l'elettricità è scomoda.",
)

L["pt-BR"] = dict(
 hb_offernote="Grelha elétrica de interior para selar — termostato ajustável até cerca de 230°C, design de drenagem de gordura, placa, tampa e bandeja coletora removíveis e todas laváveis na máquina. Ideal para grelhar no dia a dia em casa com limpeza fácil. A redução de fumaça funciona com proteína magra, mas não com cortes gordurosos em alta temperatura.",
 g1_offernote="Fogareiro-grelha a butano portátil — alto calor direto, totalmente portátil sem fio, funciona com cartuchos de butano padrão. Ideal para varanda ou ambiente externo sem eletricidade. A classificação de chama aberta pode conflitar com o regulamento do prédio; o custo dos cartuchos adiciona despesa contínua.",
 hb_badge="Melhor para grelhar em interior com limpeza fácil",
 hb_review="O destaque do Hamilton Beach 25361 é que a placa, a tampa e a bandeja coletora se soltam e vão direto para a máquina de lavar louça — a limpeza em máquina mais fácil entre os elétricos aqui. O termostato ajustável atinge cerca de 230°C, quente o suficiente para selar de verdade, e dá controle direto em vez de um ajuste fixo. O design de drenagem de gordura produz resultados de baixa fumaça reais com proteína magra na ventilação de um apartamento. A contrapartida frente a um modelo mais pesado é uma placa antiaderente mais fina que perde temperatura um pouco mais rápido ao adicionar alimentos frios — então trabalhe em porções menores com cortes gordurosos.",
 hb_pros=["Placa, tampa e bandeja coletora são todas removíveis e laváveis na máquina — a limpeza mais fácil aqui","Termostato ajustável até cerca de 230°C para controle direto da temperatura de selagem","O design de drenagem mantém a fumaça baixa com proteína magra na ventilação de apartamento"],
 hb_cons=["A placa antiaderente mais fina perde temperatura mais rápido ao adicionar alimentos frios"],
 hb_specs={"Potência":"aprox. 1200 W","Tipo de placa":"Antiaderente, removível","Redução de fumaça":"Bandeja de drenagem de gordura","Limpeza":"Placa, tampa e bandeja laváveis na máquina","Temperatura":"Termostato ajustável até aprox. 230°C","Superfície de cozimento":"aprox. 760 cm²","Preço":"Intermediário"},
 g1_badge="Melhor para varanda ou churrasco ao ar livre",
 g1_review="O queimador único a butano do Gas One GS-3000 entrega alto calor direto com a vantagem da portabilidade sem fio, e inclui uma maleta de transporte e ignição automática. Para grelhar em uma varanda onde o acesso à eletricidade é limitado e a restrição de chama aberta do regulamento não se aplica, é a escolha natural. As limitações práticas para uso interno em apartamento são reais: o custo dos cartuchos se acumula com uso frequente, os cartuchos devem ser armazenados com segurança, e os regulamentos costumam restringir aparelhos de chama aberta nas varandas.",
 g1_pros=["Alto calor direto de um único queimador a butano que atinge temperaturas de selagem reais","Totalmente portátil sem fio, com maleta de transporte — utilizável à mesa ou ao ar livre","Ignição automática e cartuchos de butano padrão facilitam a montagem em qualquer lugar"],
 g1_cons=["A classificação de chama aberta pode violar o regulamento do prédio"],
 g1_specs={"Fonte de calor":"Gás butano (queimador único)","Ignição":"Botão automático","Redução de fumaça":"Canal de drenagem sob a placa","Limpeza":"Placa antiaderente removível limpa com pano; limpar o corpo do queimador","Portabilidade":"Maleta de transporte incluída","Combustível":"Cartucho de butano padrão"},
 hb_rec_label="Grelhar em interior no dia a dia com a limpeza mais fácil",
 hb_rec_reason="Placa, tampa e bandeja coletora são laváveis na máquina, e o termostato ajustável atinge uma temperatura de selagem real — a opção elétrica de menor esforço aqui para cortes magros em condições de apartamento.",
 g1_rec_reason="Portátil sem fio, com maleta de transporte e alto calor direto a butano — a escolha natural para ambiente externo ou varanda onde a eletricidade é inconveniente.",
)

L["id"] = dict(
 hb_offernote="Pemanggang listrik dalam ruangan untuk menyeer — termostat yang dapat disesuaikan hingga sekitar 230°C, desain pengaliran lemak, pelat, tutup, dan nampan penampung dapat dilepas dan semuanya aman untuk mesin pencuci piring. Terbaik untuk memanggang sehari-hari di rumah dengan pembersihan mudah. Pengurangan asap bekerja pada protein tanpa lemak, tetapi tidak pada potongan berlemak pada suhu tinggi.",
 g1_offernote="Kompor-pemanggang butana portabel — panas langsung tinggi, sepenuhnya portabel tanpa kabel, berjalan dengan tabung butana standar. Terbaik untuk balkon atau luar ruangan tanpa listrik. Klasifikasi api terbuka dapat bertentangan dengan peraturan gedung; biaya tabung menambah pengeluaran berkelanjutan.",
 hb_badge="Terbaik untuk memanggang dalam ruangan yang mudah dibersihkan",
 hb_review="Keunggulan utama Hamilton Beach 25361 adalah pelat pemanggang, tutup, dan nampan penampung semuanya bisa dilepas dan langsung masuk ke mesin pencuci piring — pembersihan mesin termudah di antara unit listrik di sini. Termostat yang dapat disesuaikan mencapai sekitar 230°C, cukup panas untuk menyeer sungguhan, dan memberi Anda kontrol langsung alih-alih preset tetap. Desain pengaliran lemak menghasilkan hasil asap rendah yang nyata dengan protein tanpa lemak dalam ventilasi apartemen. Kompromi dibanding model unggulan yang lebih berat adalah pelat antilengket yang lebih tipis yang kehilangan suhu sedikit lebih cepat saat menambahkan makanan dingin — jadi kerjakan dalam porsi lebih kecil untuk potongan berlemak.",
 hb_pros=["Pelat, tutup, dan nampan penampung semuanya dapat dilepas dan aman untuk mesin pencuci piring — pembersihan termudah di sini","Termostat yang dapat disesuaikan hingga sekitar 230°C memberi kontrol langsung atas suhu menyeer","Desain pengaliran menjaga asap tetap rendah dengan protein tanpa lemak dalam ventilasi apartemen"],
 hb_cons=["Pelat antilengket yang lebih tipis kehilangan suhu lebih cepat saat makanan dingin ditambahkan"],
 hb_specs={"Daya":"sekitar 1200 W","Jenis pelat":"Antilengket, dapat dilepas","Pengurangan asap":"Nampan pengaliran lemak","Pembersihan":"Pelat, tutup, dan nampan aman untuk mesin pencuci piring","Suhu":"Termostat dapat disesuaikan hingga sekitar 230°C","Permukaan masak":"sekitar 760 cm²","Harga":"Kelas menengah"},
 g1_badge="Terbaik untuk balkon atau memanggang luar ruangan",
 g1_review="Pembakar butana tunggal Gas One GS-3000 menghasilkan panas langsung tinggi dengan keunggulan portabilitas tanpa kabel, dan dilengkapi tas jinjing serta pemantik otomatis. Untuk memanggang di balkon dengan akses listrik terbatas dan pembatasan api terbuka peraturan gedung tidak berlaku, ini pilihan alami. Keterbatasan praktis untuk penggunaan dalam ruangan apartemen nyata: biaya tabung bertambah dengan penggunaan sering, tabung harus disimpan dengan aman, dan peraturan gedung umumnya membatasi perangkat api terbuka di balkon.",
 g1_pros=["Panas langsung tinggi dari satu pembakar butana mencapai suhu menyeer sungguhan","Sepenuhnya portabel tanpa kabel, plus tas jinjing — dapat digunakan di meja atau luar ruangan","Pemantik otomatis dan tabung butana standar memudahkan penyiapan di mana saja"],
 g1_cons=["Klasifikasi api terbuka dapat melanggar peraturan gedung apartemen"],
 g1_specs={"Sumber panas":"Gas butana (pembakar tunggal)","Pemantik":"Tombol tekan otomatis","Pengurangan asap":"Saluran tetesan di bawah pelat pemanggang","Pembersihan":"Pelat antilengket dapat dilepas dilap bersih; lap badan pembakar","Portabilitas":"Termasuk tas jinjing","Bahan bakar":"Tabung butana standar"},
 hb_rec_label="Memanggang dalam ruangan sehari-hari dengan pembersihan termudah",
 hb_rec_reason="Pelat, tutup, dan nampan penampung semuanya aman untuk mesin pencuci piring, dan termostat yang dapat disesuaikan mencapai suhu menyeer sungguhan — opsi listrik paling ringan di sini untuk potongan tanpa lemak dalam kondisi apartemen.",
 g1_rec_reason="Portabel tanpa kabel, dengan tas jinjing dan panas langsung tinggi dari butana — pilihan alami untuk luar ruangan atau balkon di mana listrik tidak praktis.",
)

L["vi"] = dict(
 hb_offernote="Vỉ nướng điện trong nhà để áp chảo — bộ điều nhiệt có thể điều chỉnh đến khoảng 230°C, thiết kế thoát mỡ, tấm nướng, nắp và khay hứng mỡ đều tháo rời và đều rửa được bằng máy rửa bát. Tốt nhất để nướng hằng ngày tại nhà với việc vệ sinh dễ dàng. Khả năng giảm khói hiệu quả với protein nạc, nhưng không với các phần thịt nhiều mỡ ở nhiệt độ cao.",
 g1_offernote="Bếp-vỉ nướng gas butan di động — nhiệt trực tiếp cao, hoàn toàn di động không cần dây điện, dùng bình gas butan tiêu chuẩn. Tốt nhất cho ban công hoặc ngoài trời nơi không có điện. Phân loại lửa hở có thể xung đột với nội quy tòa nhà; chi phí bình gas là khoản chi liên tục.",
 hb_badge="Tốt nhất để nướng trong nhà dễ vệ sinh",
 hb_review="Điểm nổi bật của Hamilton Beach 25361 là tấm nướng, nắp và khay hứng mỡ đều tháo ra và cho thẳng vào máy rửa bát — việc vệ sinh bằng máy dễ nhất trong số các thiết bị điện ở đây. Bộ điều nhiệt điều chỉnh được đạt khoảng 230°C, đủ nóng để áp chảo thực sự, và cho bạn kiểm soát trực tiếp thay vì cài đặt cố định. Thiết kế thoát mỡ tạo ra kết quả ít khói thực sự với protein nạc trong điều kiện thông gió căn hộ. Đánh đổi so với một mẫu cao cấp nặng hơn là tấm chống dính mỏng hơn mất nhiệt nhanh hơn một chút khi thêm thức ăn lạnh — vì vậy hãy nướng từng mẻ nhỏ với các phần thịt nhiều mỡ.",
 hb_pros=["Tấm nướng, nắp và khay hứng mỡ đều tháo rời và rửa được bằng máy — vệ sinh dễ nhất ở đây","Bộ điều nhiệt điều chỉnh đến khoảng 230°C cho kiểm soát trực tiếp nhiệt độ áp chảo","Thiết kế thoát mỡ giữ khói thấp với protein nạc trong thông gió căn hộ"],
 hb_cons=["Tấm chống dính mỏng hơn mất nhiệt nhanh hơn khi thêm thức ăn lạnh"],
 hb_specs={"Công suất":"khoảng 1200 W","Loại tấm":"Chống dính, tháo rời","Giảm khói":"Khay thoát mỡ","Vệ sinh":"Tấm, nắp và khay rửa được bằng máy","Nhiệt độ":"Bộ điều nhiệt điều chỉnh đến khoảng 230°C","Bề mặt nướng":"khoảng 760 cm²","Giá":"Tầm trung"},
 g1_badge="Tốt nhất cho ban công hoặc nướng ngoài trời",
 g1_review="Đầu đốt butan đơn của Gas One GS-3000 tạo nhiệt trực tiếp cao với ưu thế di động không cần dây điện, và đi kèm hộp đựng cùng nút đánh lửa tự động. Để nướng trên ban công nơi nguồn điện hạn chế và hạn chế lửa hở của nội quy không áp dụng, đây là lựa chọn tự nhiên. Hạn chế thực tế khi dùng trong nhà căn hộ là có thật: chi phí bình gas tăng dần khi dùng thường xuyên, bình gas phải được cất giữ an toàn, và nội quy tòa nhà thường hạn chế thiết bị lửa hở trên ban công.",
 g1_pros=["Nhiệt trực tiếp cao từ một đầu đốt butan đạt nhiệt độ áp chảo thực sự","Hoàn toàn di động không cần dây điện, kèm hộp đựng — dùng được trên bàn hoặc ngoài trời","Đánh lửa tự động và bình gas butan tiêu chuẩn giúp lắp đặt dễ dàng ở mọi nơi"],
 g1_cons=["Phân loại lửa hở có thể vi phạm nội quy tòa nhà căn hộ"],
 g1_specs={"Nguồn nhiệt":"Gas butan (đầu đốt đơn)","Đánh lửa":"Nút bấm tự động","Giảm khói":"Rãnh thoát mỡ dưới tấm nướng","Vệ sinh":"Tấm chống dính tháo rời lau sạch; lau thân bếp","Tính di động":"Kèm hộp đựng","Nhiên liệu":"Bình gas butan tiêu chuẩn"},
 hb_rec_label="Nướng trong nhà hằng ngày với việc vệ sinh dễ nhất",
 hb_rec_reason="Tấm nướng, nắp và khay hứng mỡ đều rửa được bằng máy, và bộ điều nhiệt điều chỉnh được đạt nhiệt độ áp chảo thực sự — lựa chọn điện ít công sức nhất ở đây cho các phần thịt nạc trong điều kiện căn hộ.",
 g1_rec_reason="Di động không cần dây điện, kèm hộp đựng và nhiệt trực tiếp cao từ butan — lựa chọn tự nhiên cho ngoài trời hoặc ban công nơi điện bất tiện.",
)

L["tr"] = dict(
 hb_offernote="Mühürlemek için iç mekan elektrikli ızgara — yaklaşık 230°C'ye kadar ayarlanabilir termostat, yağ akıtma tasarımı, çıkarılabilir ve hepsi bulaşık makinesinde yıkanabilir plaka, kapak ve damlama tepsisi. Evde günlük ızgara için ideal, kolay temizlik. Duman azaltma yağsız proteinde çalışır, yüksek ısıda yağlı parçalarda değil.",
 g1_offernote="Taşınabilir bütan ızgara ocağı — yüksek doğrudan ısı, kablosuz tamamen taşınabilir, standart bütan kartuşlarıyla çalışır. Elektriğin olmadığı balkon veya açık hava için ideal. Açık alev sınıflandırması bina kurallarıyla çakışabilir; kartuş maliyeti sürekli gider ekler.",
 hb_badge="Kolay temizlenen iç mekan ızgarası için en iyisi",
 hb_review="Hamilton Beach 25361'in öne çıkan özelliği ızgara plakası, kapak ve damlama tepsisinin hepsinin çıkıp doğrudan bulaşık makinesine girmesidir — buradaki elektrikli cihazlar arasında en kolay makine temizliği. Ayarlanabilir termostat yaklaşık 230°C'ye ulaşır, gerçek bir mühürleme için yeterince sıcaktır ve sabit bir ön ayar yerine doğrudan kontrol sağlar. Yağ akıtma tasarımı, daire havalandırmasında yağsız proteinle gerçek düşük dumanlı sonuçlar üretir. Daha ağır bir amiral gemisine kıyasla ödün, soğuk yiyecek eklenince biraz daha hızlı ısı kaybeden daha ince yapışmaz plakadır — bu yüzden yağlı parçalar için daha küçük porsiyonlarla çalışın.",
 hb_pros=["Plaka, kapak ve damlama tepsisinin hepsi çıkarılabilir ve bulaşık makinesinde yıkanabilir — buradaki en kolay temizlik","Yaklaşık 230°C'ye kadar ayarlanabilir termostat mühürleme sıcaklığında doğrudan kontrol sağlar","Akıtma tasarımı daire havalandırmasında yağsız proteinle dumanı düşük tutar"],
 hb_cons=["Daha ince yapışmaz plaka soğuk yiyecek eklenince daha hızlı ısı kaybeder"],
 hb_specs={"Güç":"yaklaşık 1200 W","Plaka tipi":"Yapışmaz, çıkarılabilir","Duman azaltma":"Yağ akıtma tepsisi","Temizlik":"Plaka, kapak ve tepsi bulaşık makinesinde yıkanabilir","Sıcaklık":"Yaklaşık 230°C'ye kadar ayarlanabilir termostat","Pişirme yüzeyi":"yaklaşık 760 cm²","Fiyat":"Orta sınıf"},
 g1_badge="Balkon veya açık hava ızgarası için en iyisi",
 g1_review="Gas One GS-3000'in tek bütan brülörü, kablosuz taşınabilirlik avantajıyla yüksek doğrudan ısı sağlar ve bir taşıma çantası ile otomatik ateşleme içerir. Elektrik erişiminin sınırlı olduğu ve bina kurallarındaki açık alev kısıtlamasının geçerli olmadığı bir balkonda ızgara için doğal seçimdir. Daire iç mekan kullanımı için pratik sınırlamalar gerçektir: kartuş maliyeti sık kullanımla artar, kartuşlar güvenli saklanmalıdır ve bina kuralları genellikle balkonlarda açık alevli cihazları kısıtlar.",
 g1_pros=["Tek bütan brülöründen gerçek mühürleme sıcaklıklarına ulaşan yüksek doğrudan ısı","Kablosuz tamamen taşınabilir, ayrıca taşıma çantası — masada veya açık havada kullanılabilir","Otomatik ateşleme ve standart bütan kartuşları her yerde kurulumu kolaylaştırır"],
 g1_cons=["Açık alev sınıflandırması daire bina kurallarını ihlal edebilir"],
 g1_specs={"Isı kaynağı":"Bütan gazı (tek brülör)","Ateşleme":"Otomatik basmalı düğme","Duman azaltma":"Izgara plakası altında damlama kanalı","Temizlik":"Çıkarılabilir yapışmaz plaka silinerek temizlenir; brülör gövdesini silin","Taşınabilirlik":"Taşıma çantası dahil","Yakıt":"Standart bütan kartuşu"},
 hb_rec_label="En kolay temizlikle günlük iç mekan ızgarası",
 hb_rec_reason="Plaka, kapak ve damlama tepsisinin hepsi bulaşık makinesinde yıkanabilir ve ayarlanabilir termostat gerçek bir mühürleme sıcaklığına ulaşır — daire koşullarında yağsız parçalar için buradaki en az çaba gerektiren elektrikli seçenek.",
 g1_rec_reason="Kablosuz taşınabilir, taşıma çantalı ve bütandan yüksek doğrudan ısı — elektriğin zahmetli olduğu açık hava veya balkon için doğal seçim.",
)

L["ru"] = dict(
 hb_offernote="Электрический гриль для дома с обжаркой — регулируемый термостат примерно до 230°C, конструкция со стоком жира, съёмные пластина, крышка и поддон для капель, все можно мыть в посудомоечной машине. Лучший для повседневной готовки дома с лёгкой очисткой. Снижение дыма работает с постным белком, но не с жирными кусками при высокой температуре.",
 g1_offernote="Портативная бутановая горелка-гриль — высокий прямой жар, полностью портативна без шнура, работает на стандартных бутановых картриджах. Лучший вариант для балкона или улицы, где нет электричества. Классификация открытого огня может конфликтовать с правилами дома; стоимость картриджей добавляет постоянные расходы.",
 hb_badge="Лучший для домашнего гриля с лёгкой очисткой",
 hb_review="Главное преимущество Hamilton Beach 25361 в том, что пластина гриля, крышка и поддон для капель снимаются и отправляются прямо в посудомоечную машину — самая лёгкая машинная очистка среди электрических устройств здесь. Регулируемый термостат достигает около 230°C, достаточно для настоящей обжарки, и даёт прямой контроль вместо фиксированной настройки. Конструкция со стоком жира даёт действительно малодымные результаты с постным белком при квартирной вентиляции. Компромисс по сравнению с более тяжёлой флагманской моделью — более тонкая антипригарная пластина, которая чуть быстрее теряет температуру при добавлении холодных продуктов, поэтому для жирных кусков работайте небольшими порциями.",
 hb_pros=["Пластина, крышка и поддон для капель все съёмные и пригодны для посудомоечной машины — самая лёгкая очистка здесь","Регулируемый термостат примерно до 230°C даёт прямой контроль температуры обжарки","Конструкция со стоком жира удерживает дым низким с постным белком при квартирной вентиляции"],
 hb_cons=["Более тонкая антипригарная пластина быстрее теряет температуру при добавлении холодных продуктов"],
 hb_specs={"Мощность":"около 1200 Вт","Тип пластины":"Антипригарная, съёмная","Снижение дыма":"Поддон для стока жира","Очистка":"Пластина, крышка и поддон пригодны для посудомоечной машины","Температура":"Регулируемый термостат примерно до 230°C","Поверхность готовки":"около 760 см²","Цена":"Средний класс"},
 g1_badge="Лучший для балкона или гриля на улице",
 g1_review="Одиночная бутановая горелка Gas One GS-3000 даёт высокий прямой жар с преимуществом портативности без шнура и включает чехол для переноски и автоматический поджиг. Для гриля на балконе, где доступ к электричеству ограничен и ограничение на открытый огонь в правилах дома не применяется, это естественный выбор. Практические ограничения для использования в квартире реальны: стоимость картриджей растёт при частом использовании, картриджи нужно безопасно хранить, а правила дома обычно ограничивают устройства с открытым огнём на балконах.",
 g1_pros=["Высокий прямой жар от одной бутановой горелки достигает настоящих температур обжарки","Полностью портативна без шнура, плюс чехол для переноски — можно использовать за столом или на улице","Автоматический поджиг и стандартные бутановые картриджи упрощают установку где угодно"],
 g1_cons=["Классификация открытого огня может нарушать правила жилого дома"],
 g1_specs={"Источник тепла":"Бутановый газ (одна горелка)","Поджиг":"Автоматическая кнопка","Снижение дыма":"Канал стока под пластиной гриля","Очистка":"Съёмная антипригарная пластина протирается; протрите корпус горелки","Портативность":"Чехол для переноски в комплекте","Топливо":"Стандартный бутановый картридж"},
 hb_rec_label="Повседневный домашний гриль с самой лёгкой очисткой",
 hb_rec_reason="Пластина, крышка и поддон для капель пригодны для посудомоечной машины, а регулируемый термостат достигает настоящей температуры обжарки — самый необременительный электрический вариант здесь для постных кусков в квартирных условиях.",
 g1_rec_reason="Портативна без шнура, с чехлом для переноски и высоким прямым жаром бутана — естественный выбор для улицы или балкона, где электричество неудобно.",
)

L["ko"] = dict(
 hb_offernote="시어링용 실내 전기 그릴 — 약 230°C까지 조절 가능한 온도 다이얼, 기름 배출 설계, 분리형 그릴 플레이트·뚜껑·기름받이가 모두 식기세척기 사용 가능. 손쉬운 청소로 매일 굽기에 최적. 연기 억제는 살코기에는 효과적이지만 고온의 기름진 부위에는 그렇지 않음.",
 g1_offernote="휴대용 부탄 그릴 스토브 — 높은 직화 열, 전원 코드 없이 완전 휴대 가능, 표준 부탄 카트리지로 작동. 전기가 없는 발코니나 야외에 최적. 개방 화염 분류가 건물 규정과 충돌할 수 있으며 카트리지 비용이 지속 비용으로 발생.",
 hb_badge="청소가 쉬운 실내 그릴에 최적",
 hb_review="Hamilton Beach 25361의 두드러진 특징은 그릴 플레이트, 뚜껑, 기름받이가 모두 분리되어 식기세척기에 바로 들어간다는 점입니다 — 여기 전기 기종 중 기계 세척이 가장 쉽습니다. 조절 가능한 온도 다이얼은 약 230°C에 도달해 진짜 시어링에 충분히 뜨겁고, 고정 프리셋 대신 직접 제어할 수 있게 해줍니다. 기름 배출 설계는 아파트 환기 조건에서 살코기로 실제로 연기가 적은 결과를 만듭니다. 더 무거운 플래그십과의 트레이드오프는 더 얇은 논스틱 플레이트로, 차가운 음식을 넣으면 온도가 조금 더 빨리 떨어지므로 기름진 부위는 소량씩 구우세요.",
 hb_pros=["그릴 플레이트·뚜껑·기름받이가 모두 분리되고 식기세척기 사용 가능 — 여기서 가장 쉬운 청소","약 230°C까지 조절 가능한 온도 다이얼로 시어링 온도를 직접 제어","기름 배출 설계가 아파트 환기에서 살코기로 연기를 낮게 유지"],
 hb_cons=["더 얇은 논스틱 플레이트는 차가운 음식을 넣으면 온도가 더 빨리 떨어짐"],
 hb_specs={"소비전력":"약 1200 W","플레이트 유형":"논스틱, 분리형","연기 저감":"기름 배출 트레이","청소":"플레이트·뚜껑·트레이 식기세척기 사용 가능","온도":"약 230°C까지 조절 다이얼","조리 면적":"약 760 cm²","가격":"중급"},
 g1_badge="발코니 또는 야외 그릴에 최적",
 g1_review="Gas One GS-3000의 단일 부탄 버너는 전원 코드 없는 휴대성의 이점과 함께 높은 직화 열을 제공하며, 휴대용 케이스와 자동 점화 버튼이 포함됩니다. 전기 접근이 제한되고 건물 규정의 개방 화염 제한이 적용되지 않는 발코니 그릴에는 자연스러운 선택입니다. 아파트 실내 사용의 실질적 제약은 현실적입니다: 카트리지 비용은 자주 사용하면 누적되고, 카트리지는 안전하게 보관해야 하며, 건물 규정은 보통 발코니의 개방 화염 기기를 제한합니다.",
 g1_pros=["단일 부탄 버너의 높은 직화 열이 진짜 시어링 온도에 도달","전원 코드 없이 완전 휴대 가능, 휴대 케이스 포함 — 식탁이나 야외에서 사용 가능","자동 점화와 표준 부탄 카트리지로 어디서나 설치가 간편"],
 g1_cons=["개방 화염 분류가 아파트 건물 규정을 위반할 수 있음"],
 g1_specs={"열원":"부탄 가스(단일 버너)","점화":"자동 푸시 버튼","연기 저감":"그릴 플레이트 아래 배출 채널","청소":"분리형 논스틱 플레이트는 닦아서 청소; 버너 본체는 닦기","휴대성":"휴대 케이스 포함","연료":"표준 부탄 카트리지"},
 hb_rec_label="청소가 가장 쉬운 일상 실내 그릴",
 hb_rec_reason="그릴 플레이트·뚜껑·기름받이가 모두 식기세척기 사용 가능하고 조절 다이얼이 진짜 시어링 온도에 도달 — 아파트 조건에서 살코기를 위한 가장 손이 덜 가는 전기 옵션.",
 g1_rec_reason="전원 코드 없이 휴대 가능하고 휴대 케이스와 부탄의 높은 직화 열 — 전기가 불편한 야외나 발코니에 자연스러운 선택.",
)

L["zh-CN"] = dict(
 hb_offernote="室内电烤炉煎烤 — 可调温度旋钮最高约230°C，导油设计，烤盘、盖子和滴油盘均可拆卸且均可机洗。最适合在家日常烧烤，清洁轻松。减烟对瘦肉蛋白有效，但高温下对肥腻部位无效。",
 g1_offernote="便携式丁烷烤炉 — 高直接热量，完全便携无需电源线，使用标准丁烷气罐。最适合无电源的阳台或户外。明火分类可能与楼宇规定冲突；气罐成本带来持续开支。",
 hb_badge="易清洁室内烧烤最佳",
 hb_review="Hamilton Beach 25361的突出特点是烤盘、盖子和滴油盘都可拆下并直接放入洗碗机——是这里电动机型中机洗最轻松的。可调温度旋钮可达约230°C，足够进行真正的煎烤，并让你直接控制而非固定预设。导油设计在公寓通风条件下用瘦肉蛋白能产生真正的低烟效果。与更重的旗舰相比的取舍是更薄的不粘烤盘，加入冷食时降温稍快——因此肥腻部位请分小批烹饪。",
 hb_pros=["烤盘、盖子和滴油盘均可拆卸且可机洗——这里最轻松的清洁","可调温度旋钮最高约230°C，直接控制煎烤温度","导油设计在公寓通风下用瘦肉蛋白保持低烟"],
 hb_cons=["更薄的不粘烤盘在加入冷食时降温更快"],
 hb_specs={"功率":"约1200 W","烤盘类型":"不粘，可拆卸","减烟":"导油盘","清洁":"烤盘、盖子和盘均可机洗","温度":"可调旋钮最高约230°C","烹饪面积":"约760平方厘米","价格":"中端"},
 g1_badge="阳台或户外烧烤最佳",
 g1_review="Gas One GS-3000的单丁烷燃烧器提供高直接热量，兼具无电源线的便携优势，并配有便携箱和自动点火按钮。对于电力受限且楼宇规定的明火限制不适用的阳台烧烤，这是自然之选。公寓室内使用的实际限制是真实存在的：频繁使用时气罐成本累积，气罐需安全存放，楼宇规定通常限制阳台上的明火设备。",
 g1_pros=["单丁烷燃烧器的高直接热量可达真正的煎烤温度","完全便携无需电源线，附便携箱——可在餐桌或户外使用","自动点火和标准丁烷气罐让任何地方都易于安装"],
 g1_cons=["明火分类可能违反公寓楼宇规定"],
 g1_specs={"热源":"丁烷气（单燃烧器）","点火":"自动按钮","减烟":"烤盘下的滴油槽","清洁":"可拆卸不粘烤盘擦拭即净；擦拭燃烧器本体","便携性":"含便携箱","燃料":"标准丁烷气罐"},
 hb_rec_label="清洁最轻松的日常室内烧烤",
 hb_rec_reason="烤盘、盖子和滴油盘均可机洗，可调旋钮可达真正的煎烤温度——在公寓条件下烹饪瘦肉部位最省事的电动选择。",
 g1_rec_reason="无电源线便携，附便携箱，丁烷高直接热量——电力不便的户外或阳台的自然之选。",
)

L["zh-TW"] = dict(
 hb_offernote="室內電烤爐煎烤 — 可調溫度旋鈕最高約230°C，導油設計，烤盤、蓋子和滴油盤均可拆卸且皆可機洗。最適合在家日常燒烤，清潔輕鬆。減煙對瘦肉蛋白有效，但高溫下對肥膩部位無效。",
 g1_offernote="便攜式丁烷烤爐 — 高直接熱量，完全便攜無需電源線，使用標準丁烷氣罐。最適合無電源的陽台或戶外。明火分類可能與大樓規定衝突；氣罐成本帶來持續開支。",
 hb_badge="易清潔室內燒烤最佳",
 hb_review="Hamilton Beach 25361的突出特點是烤盤、蓋子和滴油盤都可拆下並直接放入洗碗機——是這裡電動機型中機洗最輕鬆的。可調溫度旋鈕可達約230°C，足以進行真正的煎烤，並讓你直接控制而非固定預設。導油設計在公寓通風條件下用瘦肉蛋白能產生真正的低煙效果。與更重的旗艦相比的取捨是更薄的不沾烤盤，加入冷食時降溫稍快——因此肥膩部位請分小批烹調。",
 hb_pros=["烤盤、蓋子和滴油盤均可拆卸且可機洗——這裡最輕鬆的清潔","可調溫度旋鈕最高約230°C，直接控制煎烤溫度","導油設計在公寓通風下用瘦肉蛋白保持低煙"],
 hb_cons=["更薄的不沾烤盤在加入冷食時降溫更快"],
 hb_specs={"功率":"約1200 W","烤盤類型":"不沾，可拆卸","減煙":"導油盤","清潔":"烤盤、蓋子和盤均可機洗","溫度":"可調旋鈕最高約230°C","烹飪面積":"約760平方公分","價格":"中階"},
 g1_badge="陽台或戶外燒烤最佳",
 g1_review="Gas One GS-3000的單丁烷燃燒器提供高直接熱量，兼具無電源線的便攜優勢，並配有便攜箱和自動點火按鈕。對於電力受限且大樓規定的明火限制不適用的陽台燒烤，這是自然之選。公寓室內使用的實際限制是真實存在的：頻繁使用時氣罐成本累積，氣罐需安全存放，大樓規定通常限制陽台上的明火設備。",
 g1_pros=["單丁烷燃燒器的高直接熱量可達真正的煎烤溫度","完全便攜無需電源線，附便攜箱——可在餐桌或戶外使用","自動點火和標準丁烷氣罐讓任何地方都易於安裝"],
 g1_cons=["明火分類可能違反公寓大樓規定"],
 g1_specs={"功率":"約1200 W","熱源":"丁烷氣（單燃燒器）","點火":"自動按鈕","減煙":"烤盤下的滴油槽","清潔":"可拆卸不沾烤盤擦拭即淨；擦拭燃燒器本體","便攜性":"含便攜箱","燃料":"標準丁烷氣罐"},
 hb_rec_label="清潔最輕鬆的日常室內燒烤",
 hb_rec_reason="烤盤、蓋子和滴油盤均可機洗，可調旋鈕可達真正的煎烤溫度——在公寓條件下烹調瘦肉部位最省事的電動選擇。",
 g1_rec_reason="無電源線便攜，附便攜箱，丁烷高直接熱量——電力不便的戶外或陽台的自然之選。",
)

L["ar"] = dict(
 hb_offernote="شواية كهربائية داخلية للتحمير — منظم حرارة قابل للضبط حتى نحو 230°م، تصميم لتصريف الدهون، لوح الشوي والغطاء وصينية التنقيط قابلة للفصل وكلها آمنة لغسالة الصحون. الأفضل للشوي اليومي في المنزل بتنظيف سهل. تقليل الدخان يعمل مع البروتين قليل الدهن، لكن ليس مع القطع الدهنية في الحرارة العالية.",
 g1_offernote="موقد شواء بالبيوتان محمول — حرارة مباشرة عالية، محمول بالكامل بدون سلك كهرباء، يعمل بعلب بيوتان قياسية. الأفضل للشرفة أو الهواء الطلق حيث لا تتوفر الكهرباء. قد يتعارض تصنيف اللهب المكشوف مع قواعد المبنى؛ تكلفة العلب تضيف نفقات مستمرة.",
 hb_badge="الأفضل للشوي الداخلي سهل التنظيف",
 hb_review="الميزة البارزة في Hamilton Beach 25361 أن لوح الشوي والغطاء وصينية التنقيط كلها تُفصل وتوضع مباشرة في غسالة الصحون — أسهل تنظيف آلي بين الأجهزة الكهربائية هنا. يصل منظم الحرارة القابل للضبط إلى نحو 230°م، حار بما يكفي للتحمير الحقيقي، ويمنحك تحكماً مباشراً بدلاً من إعداد ثابت. ينتج تصميم تصريف الدهون نتائج منخفضة الدخان فعلاً مع البروتين قليل الدهن في تهوية الشقة. المقايضة مقابل طراز رائد أثقل هي لوح غير لاصق أرفع يفقد الحرارة أسرع قليلاً عند إضافة طعام بارد — لذا اعمل بكميات أصغر مع القطع الدهنية.",
 hb_pros=["لوح الشوي والغطاء وصينية التنقيط كلها قابلة للفصل وآمنة لغسالة الصحون — أسهل تنظيف هنا","منظم حرارة قابل للضبط حتى نحو 230°م يمنح تحكماً مباشراً في حرارة التحمير","تصميم التصريف يبقي الدخان منخفضاً مع البروتين قليل الدهن في تهوية الشقة"],
 hb_cons=["اللوح غير اللاصق الأرفع يفقد الحرارة أسرع عند إضافة طعام بارد"],
 hb_specs={"القدرة":"نحو 1200 واط","نوع اللوح":"غير لاصق، قابل للفصل","تقليل الدخان":"صينية تصريف الدهون","التنظيف":"اللوح والغطاء والصينية آمنة لغسالة الصحون","الحرارة":"منظم قابل للضبط حتى نحو 230°م","سطح الطهي":"نحو 760 سم²","السعر":"الفئة المتوسطة"},
 g1_badge="الأفضل للشرفة أو الشوي في الهواء الطلق",
 g1_review="يوفر موقد البيوتان المفرد في Gas One GS-3000 حرارة مباشرة عالية مع ميزة التنقل بدون سلك، ويتضمن حقيبة حمل وزر إشعال أوتوماتيكي. للشوي على شرفة حيث الوصول إلى الكهرباء محدود ولا ينطبق قيد اللهب المكشوف في قواعد المبنى، هو الخيار الطبيعي. القيود العملية للاستخدام الداخلي في الشقة حقيقية: تكلفة العلب تتراكم مع الاستخدام المتكرر، ويجب تخزين العلب بأمان، وقواعد المبنى غالباً ما تقيّد أجهزة اللهب المكشوف على الشرفات.",
 g1_pros=["حرارة مباشرة عالية من موقد بيوتان مفرد تصل إلى حرارة تحمير حقيقية","محمول بالكامل بدون سلك، مع حقيبة حمل — يُستخدم على الطاولة أو في الهواء الطلق","الإشعال الأوتوماتيكي وعلب البيوتان القياسية تجعل الإعداد سهلاً في أي مكان"],
 g1_cons=["قد يخالف تصنيف اللهب المكشوف قواعد مبنى الشقق"],
 g1_specs={"مصدر الحرارة":"غاز بيوتان (موقد مفرد)","الإشعال":"زر ضغط أوتوماتيكي","تقليل الدخان":"قناة تصريف أسفل لوح الشوي","التنظيف":"اللوح غير اللاصق القابل للفصل يُمسح؛ امسح جسم الموقد","قابلية النقل":"تتضمن حقيبة حمل","الوقود":"علبة بيوتان قياسية"},
 hb_rec_label="الشوي الداخلي اليومي بأسهل تنظيف",
 hb_rec_reason="لوح الشوي والغطاء وصينية التنقيط كلها آمنة لغسالة الصحون، ويصل المنظم القابل للضبط إلى حرارة تحمير حقيقية — أقل خيار كهربائي جهداً هنا للقطع قليلة الدهن في ظروف الشقة.",
 g1_rec_reason="محمول بدون سلك، مع حقيبة حمل وحرارة بيوتان مباشرة عالية — الخيار الطبيعي للهواء الطلق أو الشرفة حيث الكهرباء غير عملية.",
)

L["hi"] = dict(
 hb_offernote="सीयरिंग के लिए इनडोर इलेक्ट्रिक ग्रिल — लगभग 230°C तक समायोज्य तापमान डायल, वसा निकासी डिज़ाइन, हटाने योग्य ग्रिल प्लेट, ढक्कन और ड्रिप ट्रे सभी डिशवॉशर-सुरक्षित। आसान सफाई के साथ घर पर रोज़ाना ग्रिल करने के लिए सर्वोत्तम। धुआं कम करना दुबले प्रोटीन पर काम करता है, उच्च ताप पर वसायुक्त टुकड़ों पर नहीं।",
 g1_offernote="पोर्टेबल ब्यूटेन ग्रिल स्टोव — उच्च सीधी गर्मी, बिना तार के पूरी तरह पोर्टेबल, मानक ब्यूटेन कार्ट्रिज पर चलता है। बिजली न होने पर बालकनी या बाहरी उपयोग के लिए सर्वोत्तम। खुली लौ वर्गीकरण भवन नियमों से टकरा सकता है; कार्ट्रिज लागत निरंतर खर्च जोड़ती है।",
 hb_badge="आसान सफाई वाली इनडोर ग्रिलिंग के लिए सर्वोत्तम",
 hb_review="Hamilton Beach 25361 की प्रमुख विशेषता यह है कि ग्रिल प्लेट, ढक्कन और ड्रिप ट्रे सभी निकल जाते हैं और सीधे डिशवॉशर में चले जाते हैं — यहाँ इलेक्ट्रिक इकाइयों में सबसे आसान मशीन सफाई। समायोज्य तापमान डायल लगभग 230°C तक पहुँचता है, असली सीयरिंग के लिए पर्याप्त गर्म, और निश्चित प्रीसेट के बजाय सीधा नियंत्रण देता है। वसा निकासी डिज़ाइन अपार्टमेंट वेंटिलेशन में दुबले प्रोटीन के साथ वास्तविक कम-धुआं परिणाम देता है। भारी फ्लैगशिप की तुलना में समझौता एक पतली नॉन-स्टिक प्लेट है जो ठंडा भोजन जोड़ने पर तापमान थोड़ा तेज़ी से खोती है — इसलिए वसायुक्त टुकड़ों के लिए छोटे बैच में पकाएं।",
 hb_pros=["ग्रिल प्लेट, ढक्कन और ड्रिप ट्रे सभी हटाने योग्य और डिशवॉशर-सुरक्षित — यहाँ सबसे आसान सफाई","लगभग 230°C तक समायोज्य तापमान डायल सीयरिंग तापमान पर सीधा नियंत्रण देता है","निकासी डिज़ाइन अपार्टमेंट वेंटिलेशन में दुबले प्रोटीन के साथ धुआं कम रखता है"],
 hb_cons=["पतली नॉन-स्टिक प्लेट ठंडा भोजन जोड़ने पर तापमान तेज़ी से खोती है"],
 hb_specs={"पावर":"लगभग 1200 W","प्लेट प्रकार":"नॉन-स्टिक, हटाने योग्य","धुआं कमी":"वसा निकासी ट्रे","सफाई":"प्लेट, ढक्कन और ट्रे डिशवॉशर-सुरक्षित","तापमान":"लगभग 230°C तक समायोज्य डायल","पकाने की सतह":"लगभग 760 वर्ग सेमी","कीमत":"मध्यम श्रेणी"},
 g1_badge="बालकनी या बाहरी ग्रिलिंग के लिए सर्वोत्तम",
 g1_review="Gas One GS-3000 का एकल ब्यूटेन बर्नर बिना तार की पोर्टेबिलिटी के लाभ के साथ उच्च सीधी गर्मी देता है, और इसमें एक कैरींग केस और स्वचालित इग्निशन बटन शामिल है। ऐसी बालकनी पर ग्रिलिंग के लिए जहाँ बिजली की पहुँच सीमित है और भवन नियमों का खुली लौ प्रतिबंध लागू नहीं होता, यह स्वाभाविक विकल्प है। अपार्टमेंट इनडोर उपयोग की व्यावहारिक सीमाएं वास्तविक हैं: बार-बार उपयोग से कार्ट्रिज लागत बढ़ती है, कार्ट्रिज को सुरक्षित रूप से संग्रहीत करना होगा, और भवन नियम आमतौर पर बालकनियों पर खुली लौ उपकरणों को प्रतिबंधित करते हैं।",
 g1_pros=["एकल ब्यूटेन बर्नर से उच्च सीधी गर्मी जो असली सीयरिंग तापमान तक पहुँचती है","बिना तार के पूरी तरह पोर्टेबल, साथ में कैरींग केस — मेज पर या बाहर उपयोग योग्य","स्वचालित इग्निशन और मानक ब्यूटेन कार्ट्रिज कहीं भी सेटअप आसान बनाते हैं"],
 g1_cons=["खुली लौ वर्गीकरण अपार्टमेंट भवन नियमों का उल्लंघन कर सकता है"],
 g1_specs={"ताप स्रोत":"ब्यूटेन गैस (एकल बर्नर)","इग्निशन":"स्वचालित पुश-बटन","धुआं कमी":"ग्रिल प्लेट के नीचे ड्रिप चैनल","सफाई":"हटाने योग्य नॉन-स्टिक प्लेट पोंछकर साफ; बर्नर बॉडी पोंछें","पोर्टेबिलिटी":"कैरींग केस शामिल","ईंधन":"मानक ब्यूटेन कार्ट्रिज"},
 hb_rec_label="सबसे आसान सफाई के साथ रोज़ाना इनडोर ग्रिलिंग",
 hb_rec_reason="ग्रिल प्लेट, ढक्कन और ड्रिप ट्रे सभी डिशवॉशर-सुरक्षित हैं, और समायोज्य डायल असली सीयरिंग तापमान तक पहुँचता है — अपार्टमेंट परिस्थितियों में दुबले टुकड़ों के लिए यहाँ सबसे कम मेहनत वाला इलेक्ट्रिक विकल्प।",
 g1_rec_reason="बिना तार के पोर्टेबल, कैरींग केस और ब्यूटेन की उच्च सीधी गर्मी के साथ — बाहरी या बालकनी उपयोग के लिए स्वाभाविक विकल्प जहाँ बिजली असुविधाजनक है।",
)

L["th"] = dict(
 hb_offernote="เตาย่างไฟฟ้าในร่มสำหรับซีร์ — ปุ่มปรับอุณหภูมิได้ถึงประมาณ 230°C ดีไซน์ระบายไขมัน แผ่นย่าง ฝา และถาดรองน้ำมันถอดได้และล้างเครื่องล้างจานได้ทั้งหมด เหมาะที่สุดสำหรับการย่างประจำวันที่บ้านพร้อมทำความสะอาดง่าย การลดควันได้ผลกับโปรตีนไม่ติดมัน แต่ไม่ได้กับชิ้นติดมันที่ความร้อนสูง",
 g1_offernote="เตาย่างแก๊สบิวเทนพกพา — ความร้อนตรงสูง พกพาได้เต็มที่ไม่ต้องใช้สายไฟ ใช้กระป๋องบิวเทนมาตรฐาน เหมาะที่สุดสำหรับระเบียงหรือกลางแจ้งที่ไม่มีไฟฟ้า การจัดประเภทเปลวไฟเปิดอาจขัดกับกฎอาคาร ค่ากระป๋องเป็นค่าใช้จ่ายต่อเนื่อง",
 hb_badge="ดีที่สุดสำหรับการย่างในร่มที่ทำความสะอาดง่าย",
 hb_review="จุดเด่นของ Hamilton Beach 25361 คือแผ่นย่าง ฝา และถาดรองน้ำมันถอดออกได้ทั้งหมดและใส่เครื่องล้างจานได้โดยตรง — ทำความสะอาดด้วยเครื่องง่ายที่สุดในบรรดาเครื่องไฟฟ้าที่นี่ ปุ่มปรับอุณหภูมิไปถึงประมาณ 230°C ร้อนพอสำหรับการซีร์จริง และให้คุณควบคุมโดยตรงแทนค่าตั้งคงที่ ดีไซน์ระบายไขมันให้ผลควันต่ำจริงกับโปรตีนไม่ติดมันในการระบายอากาศของอพาร์ตเมนต์ ข้อแลกเปลี่ยนเทียบกับรุ่นเรือธงที่หนักกว่าคือแผ่นไม่ติดที่บางกว่าซึ่งสูญเสียอุณหภูมิเร็วขึ้นเล็กน้อยเมื่อใส่อาหารเย็น — จึงควรย่างทีละน้อยสำหรับชิ้นติดมัน",
 hb_pros=["แผ่นย่าง ฝา และถาดรองน้ำมันถอดได้ทั้งหมดและล้างเครื่องล้างจานได้ — ทำความสะอาดง่ายที่สุดที่นี่","ปุ่มปรับอุณหภูมิได้ถึงประมาณ 230°C ให้ควบคุมอุณหภูมิซีร์โดยตรง","ดีไซน์ระบายช่วยให้ควันต่ำกับโปรตีนไม่ติดมันในการระบายอากาศของอพาร์ตเมนต์"],
 hb_cons=["แผ่นไม่ติดที่บางกว่าสูญเสียอุณหภูมิเร็วขึ้นเมื่อใส่อาหารเย็น"],
 hb_specs={"กำลังไฟ":"ประมาณ 1200 W","ประเภทแผ่น":"ไม่ติด ถอดได้","การลดควัน":"ถาดระบายไขมัน","การทำความสะอาด":"แผ่น ฝา และถาดล้างเครื่องล้างจานได้","อุณหภูมิ":"ปุ่มปรับได้ถึงประมาณ 230°C","พื้นผิวทำอาหาร":"ประมาณ 760 ตร.ซม.","ราคา":"ระดับกลาง"},
 g1_badge="ดีที่สุดสำหรับระเบียงหรือย่างกลางแจ้ง",
 g1_review="หัวเตาบิวเทนเดี่ยวของ Gas One GS-3000 ให้ความร้อนตรงสูงพร้อมข้อได้เปรียบด้านการพกพาที่ไม่ต้องใช้สายไฟ และมาพร้อมกระเป๋าพกพาและปุ่มจุดไฟอัตโนมัติ สำหรับการย่างบนระเบียงที่ไฟฟ้าเข้าถึงจำกัดและข้อจำกัดเปลวไฟเปิดของกฎอาคารไม่บังคับใช้ นี่คือตัวเลือกตามธรรมชาติ ข้อจำกัดในทางปฏิบัติสำหรับการใช้ในร่มในอพาร์ตเมนต์เป็นเรื่องจริง: ค่ากระป๋องสะสมเมื่อใช้บ่อย ต้องเก็บกระป๋องอย่างปลอดภัย และกฎอาคารมักจำกัดอุปกรณ์เปลวไฟเปิดบนระเบียง",
 g1_pros=["ความร้อนตรงสูงจากหัวเตาบิวเทนเดี่ยวที่ถึงอุณหภูมิซีร์จริง","พกพาได้เต็มที่ไม่ต้องใช้สายไฟ พร้อมกระเป๋าพกพา — ใช้ที่โต๊ะหรือกลางแจ้งได้","ปุ่มจุดไฟอัตโนมัติและกระป๋องบิวเทนมาตรฐานทำให้ติดตั้งง่ายทุกที่"],
 g1_cons=["การจัดประเภทเปลวไฟเปิดอาจละเมิดกฎอาคารอพาร์ตเมนต์"],
 g1_specs={"แหล่งความร้อน":"แก๊สบิวเทน (หัวเตาเดี่ยว)","การจุดไฟ":"ปุ่มกดอัตโนมัติ","การลดควัน":"ช่องระบายใต้แผ่นย่าง","การทำความสะอาด":"แผ่นไม่ติดถอดได้เช็ดสะอาด เช็ดตัวหัวเตา","การพกพา":"มีกระเป๋าพกพา","เชื้อเพลิง":"กระป๋องบิวเทนมาตรฐาน"},
 hb_rec_label="ย่างในร่มประจำวันด้วยการทำความสะอาดที่ง่ายที่สุด",
 hb_rec_reason="แผ่นย่าง ฝา และถาดรองน้ำมันล้างเครื่องล้างจานได้ทั้งหมด และปุ่มปรับไปถึงอุณหภูมิซีร์จริง — ตัวเลือกไฟฟ้าที่ใช้แรงน้อยที่สุดที่นี่สำหรับชิ้นไม่ติดมันในสภาพอพาร์ตเมนต์",
 g1_rec_reason="พกพาได้ไม่ต้องใช้สายไฟ พร้อมกระเป๋าพกพาและความร้อนตรงสูงจากบิวเทน — ตัวเลือกตามธรรมชาติสำหรับกลางแจ้งหรือระเบียงที่ไฟฟ้าไม่สะดวก",
)

# ---- prose token replacements applied to every non-en/ja locale ----
# brand + model swaps (order matters: longer first)
TOKEN = [
 ("Zojirushi EB-DLC20", HB),
 ("Iwatani CB-P-Y3", G1),
 ("Zojirushi", HB),
 ("Iwatani", G1),
 ("EB-DLC20", "25361"),
 ("CB-P-Y3", "GS-3000"),
 # CJK transliterations
 ("조지루시", "Hamilton Beach"),
 ("이와타니", "Gas One"),
]

def apply_tokens(s):
    for a,b in TOKEN:
        s = s.replace(a,b)
    return s

def walk_prose(obj):
    # apply token swaps to all string values EXCEPT offerId values
    if isinstance(obj, dict):
        for k,v in obj.items():
            if k == "offerId":
                continue
            if isinstance(v,str):
                obj[k]=apply_tokens(v)
            else:
                walk_prose(v)
    elif isinstance(obj, list):
        for i,v in enumerate(obj):
            if isinstance(v,str):
                obj[i]=apply_tokens(v)
            else:
                walk_prose(v)

def set_specs(prod, new_specs):
    prod["specs"] = new_specs

for loc, tr in L.items():
    path = os.path.join(BASE, loc+".json")
    with open(path, encoding="utf-8") as f:
        d = json.load(f)

    # 1) prose token swaps everywhere (brand names, model numbers) — but we will overwrite
    #    structured fields for the two products afterward.
    walk_prose(d)

    # 2) offerNotes
    d["offerNotes"]["zojirushi-eb-dlc20"] = tr["hb_offernote"]
    d["offerNotes"]["iwatani-cb-p-y3"]    = tr["g1_offernote"]

    # 3) products[]
    for p in d["products"]:
        if p["offerId"] == "zojirushi-eb-dlc20":
            p["badge"]  = tr["hb_badge"]
            p["review"] = tr["hb_review"]
            p["pros"]   = tr["hb_pros"]
            p["cons"]   = tr["hb_cons"]
            p["specs"]  = tr["hb_specs"]
        elif p["offerId"] == "iwatani-cb-p-y3":
            p["badge"]  = tr["g1_badge"]
            p["review"] = tr["g1_review"]
            p["pros"]   = tr["g1_pros"]
            p["cons"]   = tr["g1_cons"]
            p["specs"]  = tr["g1_specs"]

    # 4) recommendedFor
    for r in d["recommendedFor"]:
        if r["offerId"] == "zojirushi-eb-dlc20":
            r["label"]  = tr["hb_rec_label"]
            r["reason"] = tr["hb_rec_reason"]
        elif r["offerId"] == "iwatani-cb-p-y3":
            r["reason"] = tr["g1_rec_reason"]

    with open(path, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("done", loc)

print("ALL DONE")
