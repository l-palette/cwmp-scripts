Смена параметров
ACS основан на параметрах: key = value, но так как модель данных отличается для каждого устройства, их необходимо корректировать.
========================================================================
Добавление устройства
В mikrotik можно зайти в winbox и перейти по вкладке TR-069.
В TR069 Client 
Enabled
ACS URL: http://192.168.240.146:7547
Periodic Inform Interval: 00:00:10
Если не все параметры устройства загрузятся на сервере, то зайдя в устройство можно нажимать Refresh и Ping, а также удаляя задания (Destroy в Task)
========================================================================
/usr/lib/node_modules/genieacs/configs/config.json
Смена имени сервера
{
"MONGODB CONNECTION_URL": "mongodb://127.0.0.1/genieacs",
"CWMP_INTERFACE": "0.0.0.0",
"CWMP_PORT": 7547,
"CWMP_SSL": false,
"NBI_INTERFACE" : "0.0.0.0",
"NBI_PORT" : 7557,
"FS_INTERFACE": "0.0.0.0",
"FS_PORT": 7567,
"FS_HOSTNAME": "192.168.240.146,
"DEBUG": false
}


~/geneieacs-gui/app/views/files/_form.html.erb
Добавим тип файла
<%= form_tag({:action => :upload}, :method => 'post', :multipart => true) do %>
<div>
  <%= label_tag('file_type', 'File type:') %>
  <%= select_tag('file_type', options_for_select(['1 Firmware Upgrade Image', '2 Web Content', '3 Vendor Configuration File', '4 Tone File', '5 Ringer File' , 'X MIKROTIK Factory Configuration File'], '1 Firmware Upgrade Image')) %>
</div>
<div>
  <%= label_tag('oui', 'OUI:') %>
  <%= text_field_tag 'oui', params[:oui] %>
</div>
<div>
  <%= label_tag('product_class', 'Product class:') %>
  <%= text_field_tag 'product_class', params[:product_class] %>
</div>
<div>
  <%= label_tag('version', 'Version:') %>
  <%= text_field_tag 'version', params[:version] %>
</div>
<div>
  <%= label_tag('file', 'File:') %>
  <%= file_field_tag('file') %>
</div>
<br/>
<%= submit_tag("Upload") %>
<% end %>


========================================================================
Автоматический запуск сервера при перезагрузке сервера
sudo crontab -e -u root
========================================================================
Загрузка файла на сервер
Files -> New file
File type: X MIKROTIK Factory Configuration File
OUI: E48D8C
Product class: RB951G-2HnD
Version: 6.43.16
File: basic_default_config.txt
cloudupdater.alter (3 Vendor Configuration File)
autobackup.alter (3 Vendor Configuration File)
========================================================================
Загрузка файла на устройство
В winbox включим запись логов - system => logging => debug
Devices => Show => Push file => basic_default_config.txt
В логах устройства должна быть зафиксирована передача файла.
В winbox - system - scripts list - script - autobackup -> remove
					  - cloudupdater -> remove
========================================================================
Провижининг - автоматизация распространения настроек.
Провижининг производится из ACS.
1 шаг - получить IP-адрес по DHCP
=============================================================
2 шаг - включить протокол 
Для этого нужно в winbox после подключения к устройству перейти в окно новый терминал и в окне TR069 Client ввести:
ip-адрес и порт, по которому доступен сервер.
интервал отправления Inform RPC на сервер поставить равным 00:00:10
код провижининга AP-UP (без провижининга)
Apply
========================================================================
3 шаг - траблшутинг
Заходим в система - логи 
Добавим темы
Debug
Tr069 
OK
========================================================================
4 шаг - экспортировать конфигурацию
В микротике ввести команду export, скопировать вывод и поместить в текстовый файл
Можно ввести любое расширение
{
:local i 0
:local x 2
:local t 10

# Цикл проверки физических интерфейсов
while ($i < $t && [:len [/interface find]] < $x) do={
:put $i # Печать текущего значения 'i' для отладки (необязательно)
:set $i ($i + 1)  # Увеличение счетчика 'i'
:delay 1  # Ожидание 1 секунды
}


if ($i = $t) do={ # Если цикл достигнет максимального времени ожидания
:log warning message="Could not load all physical interfaces"
} else={ # Если все интерфейсы найдены в пределах временного ограничения
# PASTE SCRIPT HERE

# Включает TR-069 клиент для удаленного provisioning с указанным URL ACS, включенным состоянием, интервалом информирования и кодом provisioning.
/tr069-client
set acs-url=http://192.168.254.21:7547 enabled=yes periodic-inform-interval=10s provisioning-code=AP-UP


# Добавляет базовое правило брандмауэра в цепочке `input` для разрешения установленных и связанных соединений.
/ip firewall 
    filter add chain=input action=accept connection-state=established,related comment="defconf: accept established,related"

# Устанавливает SSID (имя сети) для интерфейса беспроводной сети по умолчанию на "MikroTik".
/interface wireless
set [ find default-name=wlan1 ] ssid=MikroTik

# Настраивает шаблон клиента PPTP с именем "templink" (замените детали вашими реальными учетными данными VPN).
/interface pptp-client
add connect-to=vpnserver.com disabled=no name=templink password=Templink user=Templink

# Устанавливает идентификатор supplicant в профиле безопасности беспроводной сети по умолчанию на "MikroTik"
/interface wireless security-profiles
set [ find default=yes ] supplicant-identity=MikroTik

# Устанавливает HTML-каталог для профиля точки доступа по умолчанию на "flash/hotspot"
/ip hotspot profile
set [ find default=yes ] html-directory=flash/hotspot

# Добавляет DHCP-клиент на интерфейсе "ether1" с опциями DHCP для имени хоста и ID клиента.
/ip dhcp-client
add dhcp-options=hostname,clientid disabled=no interface=ether1

# Устанавливает часовой пояс системы на "Asia/Dubai"
/system clock
set time-zone-name=Asia/Dubai

#Включает логи на "debug" и "tr069"
/system logging
add topics=debug,tr069

# Настраивает TR-069 клиент:
# Устанавливает ACS URL на "http://192.168.254.21:7547".
# Включает TR-069.
# Устанавливает интервал периодического информирования на 10 секунд.
# Устанавливает код provisioning на "AP-UP".
/tr069-client
set acs-url=http://192.168.254.21:7547 enabled=yes periodic-inform-interval=10s provisioning-code=AP-UP
/ip dhcp-client
}
}

========================================================================
5 шаг - Загрузить конфигурацию на роутер через ACS
Переходим в push file и передаем созданный файл
В winbox в логах смотрим успех передачи файла и перезагружаем конфигурацию роутера: Система - reset configuration 
========================================================================
6 шаг - Настроить беспроводную сеть
Заходим в wireless - interface wlan1
Изменим:
Mode - ap bridge
SSID - любое название
Security profile - default
Band - 20 Hz-G/N
ARP - proxy-arp
========================================================================
7 шаг - Пароль
Система - Пароль - Изменить 
8 шаг - Создать сетевой мост
Bridge:
Name - LAN
ARP - proxy-arp
Ports:
Interface:wlan 1 - Bridge:LAN
Interface:ether1 - Bridge:LAN
========================================================================
9 шаг - Перенести DHCP на интерфейс моста
IP-DHCP-Client 
Interface = LAN 
Apply - OK
========================================================================
10 шаг - Изменить идентификатор
Система - Identity: ACS-AP - любое название
========================================================================
11 шаг - DNS
IP - DNS - Allow remote requests - Apply - OK 
========================================================================
12 шаг - Firewall
IP - Firewall - NAT - Chain: masquerade 
========================================================================
13 шаг - Поменять код провижининга
TR069 Client - Код провижининга = AP
========================================================================
14 шаг - SNMP
IP - SNMP - enabled - version: 2
========================================================================
15 шаг - SNMP
В микротике ввести команду export, скопировать вывод и поместить в текстовый файл, каждую команду необходимо поместить в скобки

/system logging {
add topics=debug,tr069
}

=============================================================
16 шаг - Добавление файла на ACS
Files - New file
File type: 3 Vendor Configuration File
OUI: E48D8C
Product class: cAP Lite
Version: 6.44.3
File: config.alter
Upload
========================================================================
17 шаг - Удалим статический маршрут
/ ip { 
 route remove 1
 }

=============================================================
18 шаг - Push file
Перезагрузим роутер и загрузим файл с ACS
/interface bridge {
add arp=proxy-arp name=LAN 
}

Создает мост с именем LAN с включенным proxy-arp.
Это позволяет устройствам, подключенным к разным портам (Ethernet и беспроводным),
взаимодействовать как будто они находятся в одном сетевом сегменте.


/interface wireless {
set [ find default-name=wlan1 ] arp=proxy-arp band=2ghz-g/n channel-width=20/40mhz-Ce disabled=no mode=ap-bridge ssid=VNS
}

Настраивает стандартный беспроводной интерфейс (предполагается, что это wlan1):
Включает пересылку proxy-arp.
Устанавливает диапазон 2,4 ГГц (поддерживает стандарты g и n).
Устанавливает ширину канала на 20 МГц или 40 МГц (в зависимости от доступности).
Отключает любую существующую конфигурацию.
Устанавливает режим в режим моста точки доступа, по сути создавая беспроводную сеть, которая подключается к проводной сети.
Устанавливает SSID (имя сети) на VNS.


/interface wireless security-profiles {
set [ find default=yes ] supplicant-identity=MikroTik 
}

Изменяет профиль безопасности по умолчанию (предполагается, что это тот, у которого default=yes):
Устанавливает supplicant-identity на MikroTik (может быть не актуально для режима моста точки доступа).


/interface bridge port {
add bridge=LAN interface=ether1
add bridge=LAN interface=wlan1
}

Добавляет два порта в мост LAN:
ether1 (предположительно, проводной порт Ethernet).
wlan1 (настроенный беспроводной интерфейс).

/ip dhcp-client {
add dhcp-options=hostname,clientid disabled=no interface=LAN
}

Создает конфигурацию DHCP-клиента на интерфейсе LAN:
Включает DHCP-опции для имени хоста и идентификатора клиента.
Отключает любую существующую конфигурацию.

/ip dns {
set allow-remote-requests=yes
}

Включает удаленные запросы DNS на маршрутизаторе. 
Это позволяет устройствам, подключенным к маршрутизатору, использовать удаленные DNS-серверы для разрешения имен.

/ip firewall filter {
add action=accept chain=input comment="defconf: accept established,related" connection-state=established,related
}
Создает правило брандмауэра в цепочке input (входящий трафик):
Разрешает установленные и связанные соединения (важно для поддержания существующих соединений).

/ip firewall nat {
add action=masquerade chain=srcnat 
}
Создает правило маскировки в цепочке srcnat (исходящий трафик):
Это преобразует частные IP-адреса устройств за маршрутизатором в общедоступный IP-адрес для исходящего трафика.

/snmp {
set enabled=yes trap-version=2 
}
Включает Simple Network Management Protocol (SNMP) с версией 2 ловушек. 
Это позволяет удаленно отслеживать маршрутизатор.

/system clock {
set time-zone-name=Asia/Dubai 
}
Устанавливает часовой пояс на Asia/Dubai. 
Вы можете заменить это на свой предпочтительный часовой пояс.

/system identity {
set name=VNS-AP
}
станавливает имя устройства на VNS-AP

/system logging {
add topics=debug,tr069 
}
Включает ведение журнала для тем debug и TR-069 (удаленное provisioning).

/tr069-client {
set acs-url=http://***ACSSERVERADDRESS***:7547 enabled=yes periodic-inform-interval=10s provisioning-code=AP 
}
Настраивает клиента TR-069 для удаленного provisioning:
Устанавливает URL ACS (Auto-Configuration Server) на заполнитель (http://***ACSSERVERADDRESS***:7547). Замените это на фактический URL вашего provisioning сервера.
Включает TR-069.
Устанавливает интервал периодической информации на 10 секунд (как часто маршрутизатор регистрируется на provisioning сервере).
Устанавливает код provisioning на AP (может быть специфичен для вашей provisioning системы).

/interface pptp-client {
remove templink
}
 /user { set [find name=admin] password=admin123  
 }
 установлен пароль для пользователя admin на admin123
 / ip { 
 route remove 1
 }
 удаляется маршрут с ID 1

=============================================================
19 шаг - Скрипты положения (provision scripts)
Name: ACSAP 
Script:
let now = Date.now(); 
declare("Downloads.[FileType:3 Vendor Configuration File]",
    {path: 1}, {path: 1});
  declare("Downloads.[FileType:3 Vendor Configuration File].FileName",
    {value: 1}, {value: "****FILENAME****.alter"});
  declare("Downloads.[FileType:3 Vendor Configuration File].Download",
    {value: 1}, {value: Date.now});


Preset
Name: ACS-AP
Events: 1 BOOT
Precondition:
	Provision Code = AP-UP
Configurations:
Provision name: ACSAP 	
Save

 
 

  














