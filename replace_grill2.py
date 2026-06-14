#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, os

BASE = "/tmp/pickly-deploy/site/src/articles/best-electric-grill-2026/messages"

# Per-locale: new lede, new sec2.0 (HB wattage para), new sec2.1 (mixed para incl Gas One),
# and the 100V replacement token pair for sec1.1.
P = {}

P["de"] = dict(
 lede="Fünf Tischgrills für den Innenbereich — ein elektrischer Searing-Grill mit spülmaschinenfesten Teilen, ein amerikanisches 5-in-1-Grillplattenhybrid, ein ikonisches Modell mit Fettablaufsystem, eine kompakte Raclette-Einheit für zwei und ein tragbarer Butankocher. Die wöchentliche Nutzungshäufigkeit, nicht die Rezeptvielfalt, entscheidet darüber, welche Spezifikation wirklich wichtig ist.",
 sec20="Die Wattleistung bestimmt die maximale Wärmeabgabe, aber die Beziehung zwischen Nennleistung und tatsächlicher Gartemperatur an der Lebensmitteloberfläche ist aufgrund von Wärmespeicherung, Plattenmaterial und Temperaturregelung nicht linear. Der Hamilton Beach 25361 läuft mit etwa 1200 W mit einem verstellbaren Thermostat, das bis rund 230°C klettert, und gibt dir so direkte Kontrolle über die Anbrattemperatur statt einer festen Voreinstellung. Seine Antihaftplatte heizt schnell vor, und über das Thermostat kannst du die Hitze für empfindliche Speisen zurücknehmen.",
 sec21="George Foreman GFO201R läuft mit 1360 W mit einer Pressaluminiumplatte und dem klassischen Muschelkontaktgrill-Design — sowohl die obere als auch die untere Platte garen gleichzeitig, was die Garzeit im Vergleich zu einer flachen Grillplatte etwa halbiert. Cuisinart GR-4N läuft mit 1500 W und ist das Gerät mit der höchsten Wattzahl in dieser Liste, mit abnehmbaren Platten für vollen Grill, vollständige Grillplatte und Halb-und-halb-Konfigurationen. Récolte RGH-1 läuft mit 700 W — deutlich weniger als die anderen — was für den beabsichtigten Einsatzzweck angemessen ist, aber bedeutet, dass es nicht bei den Temperaturen anbraten kann, die die anderen Geräte erreichen. Der Gas One GS-3000 erzeugt Hitze durch Butanverbrennung statt durch Strom, und sein Einzelbrenner liefert hohe direkte Hitze, jedoch mit weniger präziser Temperaturkontrolle als ein elektrisches Gerät mit Thermostat.",
 v100=("100V-Haushaltsstrom","gewöhnlichen Haushaltsstrom"),
)

P["fr"] = dict(
 lede="Cinq grils de table pour usage intérieur — un gril électrique à saisir aux pièces lavables au lave-vaisselle, un hybride américain 5-en-1 plancha-gril, le modèle iconique à évacuation des graisses, une unité raclette compacte pour deux et un réchaud à butane portable. La fréquence d'utilisation hebdomadaire, et non la variété des recettes, détermine quelle spécification compte vraiment.",
 sec20="La puissance en watts détermine la chaleur maximale, mais la relation entre puissance nominale et température de cuisson réelle à la surface des aliments n'est pas linéaire en raison de la masse thermique, du matériau des plaques et de la régulation de température. Le Hamilton Beach 25361 fonctionne à environ 1200 W avec un thermostat réglable qui grimpe jusqu'à environ 230°C, vous donnant un contrôle direct de la température de saisie plutôt qu'un préréglage fixe. Sa plaque antiadhésive préchauffe vite et le thermostat permet de baisser la chaleur pour les aliments délicats.",
 sec21="Le George Foreman GFO201R fonctionne à 1360 W avec une plaque en aluminium pressé et le classique design de gril à contact à coquille — les plaques supérieure et inférieure cuisent simultanément, ce qui réduit le temps de cuisson de moitié environ par rapport à une plancha plate. Le Cuisinart GR-4N fonctionne à 1500 W et est l'appareil le plus puissant de cette liste, avec des plaques amovibles passant du gril complet à la plancha complète et aux configurations moitié-moitié. Le Récolte RGH-1 fonctionne à 700 W — nettement moins que les autres — ce qui convient à son usage prévu mais signifie qu'il ne peut pas saisir aux températures atteintes par les autres appareils. Le Gas One GS-3000 génère sa chaleur par combustion de butane plutôt que par l'électricité, et son brûleur unique délivre une forte chaleur directe, mais avec un contrôle de température moins précis qu'un appareil électrique à thermostat.",
 v100=("courant domestique 100V","le courant domestique standard"),
)

P["es"] = dict(
 lede="Cinco parrillas de sobremesa para uso interior — una parrilla eléctrica para sellar con piezas aptas para lavavajillas, un híbrido de plancha americana 5-en-1, el icónico modelo de drenaje de grasa, una compacta unidad de raclette para dos y un hornillo de butano portátil. La frecuencia de uso semanal, no la variedad de recetas, determina qué especificación importa realmente.",
 sec20="Los vatios determinan la potencia máxima de calor, pero la relación entre los vatios nominales y la temperatura real de cocción en la superficie de los alimentos no es lineal debido a la masa térmica, el material de la placa y la regulación de temperatura. El Hamilton Beach 25361 funciona a unos 1200 W con un termostato ajustable que sube hasta unos 230°C, dándote control directo de la temperatura de sellado en lugar de un ajuste fijo. Su placa antiadherente se precalienta rápido y el termostato permite bajar el calor para alimentos delicados.",
 sec21="El George Foreman GFO201R funciona a 1360 W con una placa de aluminio prensado y el clásico diseño de parrilla de contacto tipo concha — las placas superior e inferior cocinan a la vez, lo que reduce el tiempo de cocción casi a la mitad frente a una plancha plana. El Cuisinart GR-4N funciona a 1500 W y es la unidad de mayor potencia de esta lista, con placas desmontables que cambian entre parrilla completa, plancha completa y configuraciones mitad y mitad. El Récolte RGH-1 funciona a 700 W — bastante menos que los otros — lo que es adecuado para su uso previsto pero significa que no puede sellar a las temperaturas que alcanzan las otras unidades. El Gas One GS-3000 genera calor por combustión de butano en lugar de electricidad, y su quemador único entrega calor directo alto, pero con un control de temperatura menos preciso que una unidad eléctrica con termostato.",
 v100=("corriente doméstica de 100V","corriente doméstica estándar"),
)

P["it"] = dict(
 lede="Cinque griglie da tavolo per uso interno — una griglia elettrica per scottare con parti lavabili in lavastoviglie, un ibrido americano 5-in-1 con piastra, un classico con scarico dei grassi, una compatta unità raclette per due, e un fornello a butano portatile. La frequenza di utilizzo settimanale, non la varietà delle ricette, determina quale specifica conta davvero.",
 sec20="I watt determinano la massima erogazione di calore, ma la relazione tra potenza nominale e temperatura reale di cottura sulla superficie del cibo non è lineare a causa della massa termica, del materiale della piastra e della regolazione della temperatura. L'Hamilton Beach 25361 funziona a circa 1200 W con un termostato regolabile che sale fino a circa 230°C, dandoti il controllo diretto della temperatura di scottatura invece di una preimpostazione fissa. La sua piastra antiaderente si preriscalda in fretta e il termostato permette di abbassare il calore per cibi delicati.",
 sec21="Il George Foreman GFO201R funziona a 1360 W con una piastra in alluminio pressato e il classico design a contatto a conchiglia — sia la piastra superiore che quella inferiore cuociono contemporaneamente, dimezzando circa il tempo di cottura rispetto a una piastra piatta. Il Cuisinart GR-4N funziona a 1500 W ed è l'unità con la potenza più alta di questa lista, con piastre rimovibili che passano tra griglia completa, piastra completa e configurazioni metà e metà. Il Récolte RGH-1 funziona a 700 W — molto meno degli altri — adatto all'uso previsto ma significa che non può scottare alle temperature raggiunte dalle altre unità. Il Gas One GS-3000 genera calore dalla combustione del butano invece che dall'elettricità, e il suo bruciatore singolo eroga alto calore diretto, ma con un controllo della temperatura meno preciso di un'unità elettrica con termostato.",
 v100=("corrente domestica a 100V","corrente domestica standard"),
)

P["pt-BR"] = dict(
 lede="Cinco grelhadores de mesa para uso interno — um grelhador elétrico para selar com peças laváveis na máquina, um híbrido americano 5-em-1 de chapa, o icônico modelo de drenagem de gordura, uma unidade compacta de raclette para dois e um fogareiro a butano portátil. A frequência de uso semanal, não a variedade de receitas, determina qual especificação realmente importa.",
 sec20="Os watts determinam a saída máxima de calor, mas a relação entre a potência nominal e a temperatura real de cozimento na superfície dos alimentos não é linear devido à massa térmica, ao material da placa e à regulação de temperatura. O Hamilton Beach 25361 funciona a cerca de 1200 W com um termostato ajustável que sobe até cerca de 230°C, dando controle direto da temperatura de selagem em vez de um ajuste fixo. Sua placa antiaderente pré-aquece rápido e o termostato permite baixar o calor para alimentos delicados.",
 sec21="O George Foreman GFO201R funciona a 1360 W com uma placa de alumínio prensado e o clássico design de grelha de contato tipo concha — as placas superior e inferior cozinham ao mesmo tempo, reduzindo o tempo de cozimento quase pela metade em relação a uma chapa plana. O Cuisinart GR-4N funciona a 1500 W e é a unidade de maior potência desta lista, com placas removíveis que alternam entre grelha completa, chapa completa e configurações meio a meio. O Récolte RGH-1 funciona a 700 W — bem menos que os outros — adequado para o uso pretendido, mas significa que não consegue selar nas temperaturas que as outras unidades alcançam. O Gas One GS-3000 gera calor pela combustão de butano em vez de eletricidade, e seu queimador único entrega alto calor direto, mas com controle de temperatura menos preciso que uma unidade elétrica com termostato.",
 v100=("corrente doméstica de 100V","corrente doméstica padrão"),
)

P["id"] = dict(
 lede="Lima pemanggang meja untuk penggunaan dalam ruangan — satu pemanggang listrik untuk menyeer dengan bagian yang aman untuk mesin pencuci piring, satu griddle hybrid 5-in-1 Amerika, satu andalan penguras lemak yang ikonik, satu unit raclette kompak untuk berdua, dan satu kompor butana portabel. Frekuensi penggunaan mingguan, bukan variasi resep, yang menentukan spesifikasi mana yang benar-benar penting.",
 sec20="Watt menentukan output panas maksimum, tetapi hubungan antara watt terukur dan suhu memasak aktual pada permukaan makanan tidak linier karena massa termal, material pelat, dan regulasi suhu. Hamilton Beach 25361 berjalan pada sekitar 1200 W dengan termostat yang dapat disesuaikan yang naik hingga sekitar 230°C, memberi Anda kontrol langsung atas suhu menyeer alih-alih preset tetap. Pelat antilengketnya memanas cepat dan termostat memungkinkan Anda menurunkan panas untuk makanan halus.",
 sec21="George Foreman GFO201R berjalan pada 1360 W dengan pelat aluminium press dan desain pemanggang kontak clamshell klasik — pelat atas dan bawah memasak bersamaan, memotong waktu memasak sekitar setengahnya dibandingkan griddle datar. Cuisinart GR-4N berjalan pada 1500 W dan merupakan unit watt tertinggi dalam daftar ini, dengan pelat yang dapat dilepas yang beralih antara pemanggang penuh, griddle penuh, dan konfigurasi setengah-setengah. Récolte RGH-1 berjalan pada 700 W — jauh lebih rendah — yang sesuai untuk penggunaan yang dimaksudkan tetapi berarti tidak dapat menyeer pada suhu yang dicapai unit lain. Gas One GS-3000 menghasilkan panas dari pembakaran butana bukan listrik, dan pembakar tunggalnya menghasilkan panas langsung tinggi, tetapi dengan kontrol suhu yang kurang presisi dibanding unit listrik bertermostat.",
 v100=("arus rumah tangga 100V","arus rumah tangga standar"),
)

P["vi"] = dict(
 lede="Năm vỉ nướng đặt bàn để dùng trong nhà — một vỉ nướng điện để áp chảo với các bộ phận rửa được bằng máy rửa bát, một griddle đa năng 5-in-1 của Mỹ, một vỉ nướng thoát mỡ huyền thoại, một bộ raclette nhỏ gọn cho hai người, và một bếp butan di động. Tần suất sử dụng hàng tuần, không phải sự đa dạng của công thức, mới quyết định thông số nào thực sự quan trọng.",
 sec20="Công suất quyết định lượng nhiệt tối đa, nhưng mối quan hệ giữa công suất danh định và nhiệt độ nấu thực tế trên bề mặt thực phẩm không tuyến tính do khối lượng nhiệt, vật liệu tấm và việc điều chỉnh nhiệt độ. Hamilton Beach 25361 chạy ở khoảng 1200 W với bộ điều nhiệt có thể điều chỉnh lên đến khoảng 230°C, cho bạn kiểm soát trực tiếp nhiệt độ áp chảo thay vì cài đặt cố định. Tấm chống dính của nó làm nóng nhanh và bộ điều nhiệt cho phép giảm nhiệt cho thực phẩm tinh tế.",
 sec21="George Foreman GFO201R chạy ở 1360 W với tấm nhôm dập và thiết kế vỉ nướng tiếp xúc dạng vỏ sò cổ điển — cả tấm trên và dưới nấu cùng lúc, cắt giảm thời gian nấu khoảng một nửa so với griddle phẳng. Cuisinart GR-4N chạy ở 1500 W và là thiết bị công suất cao nhất trong danh sách này, với các tấm tháo rời chuyển giữa vỉ nướng đầy đủ, griddle đầy đủ và cấu hình nửa-nửa. Récolte RGH-1 chạy ở 700 W — thấp hơn nhiều — phù hợp cho mục đích sử dụng nhưng nghĩa là không thể áp chảo ở nhiệt độ mà các thiết bị khác đạt được. Gas One GS-3000 tạo nhiệt từ việc đốt butan thay vì điện, và đầu đốt đơn của nó tạo nhiệt trực tiếp cao, nhưng với khả năng kiểm soát nhiệt độ kém chính xác hơn một thiết bị điện có bộ điều nhiệt.",
 v100=("dòng điện gia dụng 100V","dòng điện gia dụng tiêu chuẩn"),
)

P["tr"] = dict(
 lede="İç mekan kullanımı için beş masa üstü ızgara — bulaşık makinesinde yıkanabilir parçalı bir elektrikli mühürleme ızgarası, bir Amerikan 5-in-1 ızgara-tava kombinasyonu, ikonik bir yağ süzme ızgarası, iki kişilik kompakt bir raclette ünitesi ve taşınabilir bir bütan ocağı. Haftalık kullanım sıklığı, tarif çeşitliliği değil, hangi özelliğin gerçekten önemli olduğunu belirler.",
 sec20="Watt, maksimum ısı çıkışını belirler, ancak nominal güç ile yiyecek yüzeyindeki gerçek pişirme sıcaklığı arasındaki ilişki termal kütle, plaka malzemesi ve sıcaklık ayarı nedeniyle doğrusal değildir. Hamilton Beach 25361 yaklaşık 1200 W ile çalışır ve yaklaşık 230°C'ye kadar çıkan ayarlanabilir bir termostata sahiptir; bu, sabit bir ön ayar yerine mühürleme sıcaklığı üzerinde doğrudan kontrol sağlar. Yapışmaz plakası hızlı ısınır ve termostat hassas yiyecekler için ısıyı kısmanıza olanak tanır.",
 sec21="George Foreman GFO201R, preslenmiş alüminyum plaka ve klasik istiridye temas ızgarası tasarımıyla 1360 W ile çalışır — üst ve alt plakalar aynı anda pişirir, bu da pişirme süresini düz bir tavaya göre yaklaşık yarıya indirir. Cuisinart GR-4N 1500 W ile çalışır ve bu listedeki en yüksek watt değerine sahip cihazdır; çıkarılabilir plakaları tam ızgara, tam tava ve yarı yarıya yapılandırmalar arasında geçer. Récolte RGH-1 700 W ile çalışır — diğerlerinden çok daha az — amaçlanan kullanım için uygundur ancak diğer cihazların ulaştığı sıcaklıklarda mühürleyemez. Gas One GS-3000 ısıyı elektrik yerine bütan yanmasından üretir ve tek brülörü yüksek doğrudan ısı verir, ancak termostatlı bir elektrikli cihazdan daha az hassas sıcaklık kontrolüyle.",
 v100=("100V ev şebeke akımı","standart ev şebeke akımı"),
)

P["ru"] = dict(
 lede="Пять настольных грилей для использования в помещении — один электрический гриль для обжарки с деталями, пригодными для посудомоечной машины, один американский многофункциональный гриль-жаровня, один культовый жиросжигающий гриль, один компактный раклет для двоих и одна портативная бутановая горелка. Частота еженедельного использования, а не разнообразие рецептов, определяет, какие характеристики действительно важны.",
 sec20="Мощность определяет максимальную теплоотдачу, но связь между номинальной мощностью и реальной температурой готовки на поверхности продукта не линейна из-за тепловой массы, материала пластины и регулировки температуры. Hamilton Beach 25361 работает при около 1200 Вт с регулируемым термостатом, поднимающимся примерно до 230°C, что даёт прямой контроль температуры обжарки вместо фиксированной настройки. Его антипригарная пластина быстро прогревается, а термостат позволяет снизить жар для деликатных продуктов.",
 sec21="George Foreman GFO201R работает при 1360 Вт с прессованной алюминиевой пластиной и классической конструкцией контактного гриля-раскладушки — верхняя и нижняя пластины готовят одновременно, что сокращает время готовки примерно вдвое по сравнению с плоской жаровней. Cuisinart GR-4N работает при 1500 Вт и является самым мощным устройством в этом списке, со съёмными пластинами, переключающимися между полным грилем, полной жаровней и конфигурацией пополам. Récolte RGH-1 работает при 700 Вт — значительно меньше остальных — что подходит для его назначения, но означает, что он не может обжаривать при температурах, достигаемых другими устройствами. Gas One GS-3000 генерирует тепло за счёт сжигания бутана, а не электричества, и его одиночная горелка даёт высокий прямой жар, но с менее точным контролем температуры, чем у электрического устройства с термостатом.",
 v100=(None,None),
)

P["ko"] = dict(
 lede="실내용 테이블탑 그릴 5종 — 식기세척기 사용 가능 부품을 갖춘 전기 시어링 그릴 하나, 미국의 5-in-1 그리들 하이브리드 하나, 상징적인 지방 배출 스탠바이 하나, 2인용 콤팩트 라클레트 유닛 하나, 휴대용 부탄 스토브 하나. 레시피 다양성이 아닌 주간 사용 빈도가 어떤 스펙이 실제로 중요한지를 결정합니다.",
 sec20="와트수는 최대 열 출력을 결정하지만, 정격 와트수와 음식 표면의 실제 조리 온도 간의 관계는 열용량, 플레이트 재질, 온도 조절 설계 때문에 선형이 아닙니다. Hamilton Beach 25361은 약 1200W로 작동하며 약 230°C까지 올라가는 조절 가능한 온도 다이얼을 갖춰, 고정 프리셋 대신 시어링 온도를 직접 제어할 수 있게 해줍니다. 논스틱 플레이트는 빠르게 예열되고, 다이얼로 섬세한 음식에는 화력을 낮출 수 있습니다.",
 sec21="George Foreman GFO201R은 압착 알루미늄 플레이트와 고전적인 클램셸 접촉식 그릴 설계로 1360W로 작동합니다 — 상하 플레이트가 동시에 조리해 평평한 그리들 대비 조리 시간을 약 절반으로 줄입니다. Cuisinart GR-4N은 1500W로 이 목록에서 가장 높은 와트수이며, 분리형 플레이트가 전체 그릴, 전체 그리들, 반반 구성 사이를 전환합니다. Récolte RGH-1은 700W로 다른 기종보다 훨씬 낮아 의도된 용도에는 적합하지만 다른 기종이 도달하는 온도로는 시어링할 수 없습니다. Gas One GS-3000은 전기가 아닌 부탄 연소로 열을 내며, 단일 버너가 높은 직화 열을 내지만 다이얼식 전기 기종보다 온도 제어 정밀도는 낮습니다.",
 v100=("100V 가정용 전원","표준 가정용 전원"),
)

P["zh-CN"] = dict(
 lede="五款桌面室内烤架——一款带可机洗部件的电烤煎烤架、一款美国多功能电烤盘、一款经典排油接触式烤架、一款适合两人的紧凑型拉克莱特烤架，以及一款便携式丁烷炉。使用频率而非食谱种类，决定哪项规格实际重要。",
 sec20="功率决定最大热量输出，但额定功率与食物表面实际烹饪温度之间的关系并非线性，因为受热质量、烤盘材质和温度调节设计影响。Hamilton Beach 25361功率约1200W，配可调温度旋钮，最高可达约230°C，让你直接控制煎烤温度而非固定预设。其不粘烤盘预热快，旋钮可为娇嫩食材调低火力。",
 sec21="George Foreman GFO201R功率1360W，采用压制铝板和经典蛤壳接触式烤架设计——上下两块板同时烹饪，使烹饪时间比平板烤盘减少约一半。Cuisinart GR-4N功率1500W，是本列表中功率最高的机型，可拆卸烤盘可在全烤架、全烤盘和一半一半配置间切换。Récolte RGH-1功率700W——远低于其他机型——适合其预期用途，但意味着无法达到其他机型的煎烤温度。Gas One GS-3000通过燃烧丁烷而非电力产生热量，其单燃烧器提供高直接热量，但温度控制精度不如带旋钮的电动机型。",
 v100=("100V家用电源","标准家用电源"),
)

P["zh-TW"] = dict(
 lede="五款桌面室內烤架——一款帶可機洗部件的電烤煎烤架、一款美國多功能電烤盤、一款經典排油接觸式烤架、一款適合兩人的緊湊型拉克萊特烤架，以及一款便攜式丁烷爐。使用頻率而非食譜種類，決定哪項規格實際重要。",
 sec20="功率決定最大熱量輸出，但額定功率與食物表面實際烹飪溫度之間的關係並非線性，因為受熱質量、烤盤材質和溫度調節設計影響。Hamilton Beach 25361功率約1200W，配可調溫度旋鈕，最高可達約230°C，讓你直接控制煎烤溫度而非固定預設。其不沾烤盤預熱快，旋鈕可為嬌嫩食材調低火力。",
 sec21="George Foreman GFO201R功率1360W，採用壓製鋁板和經典蛤殼接觸式烤架設計——上下兩塊板同時烹飪，使烹飪時間比平板烤盤減少約一半。Cuisinart GR-4N功率1500W，是本列表中功率最高的機型，可拆卸烤盤可在全烤架、全烤盤和一半一半配置間切換。Récolte RGH-1功率700W——遠低於其他機型——適合其預期用途，但意味著無法達到其他機型的煎烤溫度。Gas One GS-3000透過燃燒丁烷而非電力產生熱量，其單燃燒器提供高直接熱量，但溫度控制精度不如帶旋鈕的電動機型。",
 v100=("100V家用電源","標準家用電源"),
)

P["ar"] = dict(
 lede="خمس شوايات طاولية للاستخدام الداخلي — شواية كهربائية للتحمير بأجزاء آمنة لغسالة الصحون، وشواية-مقلاة أمريكية متعددة الاستخدامات، وشواية كلاسيكية لتصريف الدهون، ووحدة راكليت مضغوطة للاثنين، وموقد بيوتان محمول. يحدد تكرار الاستخدام الأسبوعي لا تنوع الوصفات، أيَّ المواصفات يهم فعلاً.",
 sec20="تحدد الواط الحد الأقصى لإخراج الحرارة، لكن العلاقة بين القدرة المقننة ودرجة حرارة الطهي الفعلية على سطح الطعام ليست خطية بسبب الكتلة الحرارية ومادة الصفيحة وتصميم تنظيم الحرارة. تعمل Hamilton Beach 25361 بنحو 1200 واط مع منظم حرارة قابل للضبط يرتفع حتى نحو 230 درجة مئوية، ما يمنحك تحكماً مباشراً في حرارة التحمير بدلاً من إعداد ثابت. تسخن صفيحتها غير اللاصقة بسرعة ويتيح لك المنظم خفض الحرارة للأطعمة الرقيقة.",
 sec21="تعمل George Foreman GFO201R بـ 1360 واط مع صفيحة ألومنيوم مضغوطة وتصميم شواية الصدفة الكلاسيكي — تطهو الصفيحتان العلوية والسفلية في آنٍ معاً، ما يقلص وقت الطهي تقريباً إلى النصف مقارنةً بمقلاة مسطحة. تعمل Cuisinart GR-4N بـ 1500 واط وهي الأعلى واطاً في هذه القائمة، مع صفائح قابلة للإزالة تتبدل بين شواية كاملة ومقلاة كاملة وإعداد نصفي. تعمل Récolte RGH-1 بـ 700 واط — أقل بكثير من غيرها — وهو مناسب للاستخدام المقصود لكنه يعني أنها لا تستطيع التحمير بدرجات الحرارة التي تصلها الوحدات الأخرى. تولّد Gas One GS-3000 الحرارة من احتراق البيوتان لا الكهرباء، ويعطي موقدها المفرد حرارة مباشرة عالية، لكن بتحكم أقل دقة في درجة الحرارة من وحدة كهربائية بمنظم حرارة.",
 v100=(None,None),
)

P["hi"] = dict(
 lede="इनडोर उपयोग के लिए पाँच टेबलटॉप ग्रिल — डिशवॉशर-सुरक्षित हिस्सों वाली एक इलेक्ट्रिक सीयरिंग ग्रिल, एक अमेरिकी 5-इन-1 ग्रिडल हाइब्रिड, एक प्रतिष्ठित फैट-ड्रेनिंग ग्रिल, एक दो लोगों के लिए कॉम्पैक्ट रैकलेट यूनिट, और एक पोर्टेबल ब्यूटेन स्टोव। साप्ताहिक उपयोग की आवृत्ति, नुस्खों की विविधता नहीं, यह निर्धारित करती है कि कौन सी विशेषता वास्तव में मायने रखती है।",
 sec20="वाट अधिकतम ताप उत्पादन निर्धारित करते हैं, लेकिन रेटेड वाट और भोजन की सतह पर वास्तविक खाना पकाने के तापमान के बीच संबंध थर्मल मास, प्लेट सामग्री और तापमान नियमन के कारण रैखिक नहीं है। Hamilton Beach 25361 लगभग 1200 W पर चलती है और इसमें लगभग 230°C तक चढ़ने वाला समायोज्य तापमान डायल है, जो निश्चित प्रीसेट के बजाय सीयरिंग तापमान पर सीधा नियंत्रण देता है। इसकी नॉन-स्टिक प्लेट तेज़ी से गर्म होती है और डायल नाज़ुक भोजन के लिए आँच कम करने देता है।",
 sec21="George Foreman GFO201R 1360 W पर दबाई गई एल्युमीनियम प्लेट और क्लासिक क्लैमशेल संपर्क ग्रिल डिज़ाइन के साथ चलती है — ऊपरी और निचली दोनों प्लेटें एक साथ पकाती हैं, जो समतल ग्रिडल की तुलना में पकाने का समय लगभग आधा कर देती हैं। Cuisinart GR-4N 1500 W पर चलती है और इस सूची में सबसे अधिक वाट वाली इकाई है, हटाने योग्य प्लेटों के साथ जो पूर्ण ग्रिल, पूर्ण ग्रिडल और आधा-आधा विन्यास के बीच बदलती हैं। Récolte RGH-1 700 W पर चलती है — दूसरों से काफी कम — जो इसके इच्छित उपयोग के लिए उपयुक्त है लेकिन इसका मतलब है कि यह उन तापमानों पर सीयर नहीं कर सकती जो अन्य इकाइयाँ पहुँचती हैं। Gas One GS-3000 बिजली के बजाय ब्यूटेन दहन से गर्मी पैदा करती है, और इसका एकल बर्नर उच्च सीधी गर्मी देता है, लेकिन डायल वाली इलेक्ट्रिक इकाई की तुलना में कम सटीक तापमान नियंत्रण के साथ।",
 v100=("100V घरेलू करंट","मानक घरेलू करंट"),
)

P["th"] = dict(
 lede="เตาย่างตั้งโต๊ะ 5 รุ่นสำหรับใช้ในร่ม — เตาย่างไฟฟ้าสำหรับซีร์ที่มีชิ้นส่วนล้างเครื่องล้างจานได้ เตาย่าง-กริดเดิล 5-in-1 จากอเมริกา เตาย่างดูดไขมันแบบไอคอนิก ยูนิตราคเล็ตขนาดกะทัดรัดสำหรับสองคน และเตาบิวเทนพกพา ความถี่ในการใช้งานรายสัปดาห์ ไม่ใช่ความหลากหลายของสูตรอาหาร คือสิ่งที่กำหนดว่าสเปกไหนมีความสำคัญจริงๆ",
 sec20="วัตต์กำหนดกำลังความร้อนสูงสุด แต่ความสัมพันธ์ระหว่างวัตต์ที่ระบุกับอุณหภูมิการปรุงจริงบนพื้นผิวอาหารไม่เป็นเส้นตรงเนื่องจากมวลความร้อน วัสดุแผ่น และการควบคุมอุณหภูมิ Hamilton Beach 25361 ทำงานที่ประมาณ 1200 W พร้อมปุ่มปรับอุณหภูมิที่ขึ้นได้ถึงประมาณ 230°C ให้คุณควบคุมอุณหภูมิซีร์โดยตรงแทนค่าตั้งคงที่ แผ่นไม่ติดอุ่นตัวเร็วและปุ่มปรับช่วยลดความร้อนสำหรับอาหารที่บอบบางได้",
 sec21="George Foreman GFO201R ทำงานที่ 1360 W ด้วยแผ่นอลูมิเนียมอัดและดีไซน์เตาย่างสัมผัสแบบฝาหอยคลาสสิก — ทั้งแผ่นบนและล่างปรุงพร้อมกัน ลดเวลาปรุงลงประมาณครึ่งหนึ่งเทียบกับกริดเดิลแบน Cuisinart GR-4N ทำงานที่ 1500 W และเป็นเครื่องวัตต์สูงสุดในรายการนี้ ด้วยแผ่นถอดได้ที่สลับระหว่างเตาย่างเต็ม กริดเดิลเต็ม และแบบครึ่งต่อครึ่ง Récolte RGH-1 ทำงานที่ 700 W — ต่ำกว่ารุ่นอื่นมาก — เหมาะกับการใช้งานที่ตั้งใจไว้แต่หมายความว่าไม่สามารถซีร์ที่อุณหภูมิที่เครื่องอื่นถึงได้ Gas One GS-3000 สร้างความร้อนจากการเผาบิวเทนแทนไฟฟ้า และหัวเตาเดี่ยวให้ความร้อนตรงสูง แต่ควบคุมอุณหภูมิได้แม่นยำน้อยกว่าเครื่องไฟฟ้าที่มีปุ่มปรับ",
 v100=("กระแสไฟบ้าน 100V","กระแสไฟบ้านมาตรฐาน"),
)

for loc, pp in P.items():
    path = os.path.join(BASE, loc+".json")
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    d["lede"] = pp["lede"]
    d["sections"][2]["paragraphs"][0] = pp["sec20"]
    d["sections"][2]["paragraphs"][1] = pp["sec21"]
    old,new = pp["v100"]
    if old:
        d["sections"][1]["paragraphs"][1] = d["sections"][1]["paragraphs"][1].replace(old,new)
    with open(path,"w",encoding="utf-8") as f:
        json.dump(d,f,ensure_ascii=False,indent=2); f.write("\n")
    print("done",loc)
print("ALL DONE")
