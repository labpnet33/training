var e=[{title:{en:`New APs never join WLC1`,hi:`Naye APs kabhi WLC1 join nahi karte`},ticket:{en:`Facilities installed AP1 and AP2 on the third floor. Both have link lights and addresses, but show ap summary on WLC1 (10.10.99.10, VLAN 99) lists no APs. The APs are in VLAN 10.`,hi:`Facilities ne teesre floor par AP1 aur AP2 lagaye. Dono ki link lights hain aur addresses bhi, lekin WLC1 (10.10.99.10, VLAN 99) par show ap summary koi AP list nahi karta. APs VLAN 10 mein hain.`},out:`AP1> show capwap
AP name                  : AP1
AP IP address            : 10.10.10.11/24 (DHCP)
Default gateway          : 10.10.10.1
Static controller        : not set
DHCP option 43           : not received
CAPWAP state             : DISCOVERY - no controller answered

R1# show running-config | section ip dhcp pool AP-POOL
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1`,q:{en:`What is the best fix?`,hi:`Sabse accha fix kya hai?`},o:[{en:`Change the AP switch ports to trunks allowing VLAN 99`,hi:`AP switch ports ko VLAN 99 allow karne wale trunks bana do`},{en:`Add option 43 hex f104.0a0a.630a to pool AP-POOL on R1`,hi:`R1 par pool AP-POOL mein option 43 hex f104.0a0a.630a jodo`},{en:`Add option 150 ip 10.10.99.10 to pool AP-POOL`,hi:`Pool AP-POOL mein option 150 ip 10.10.99.10 jodo`},{en:`Create a dynamic interface in VLAN 10 on WLC1`,hi:`WLC1 par VLAN 10 mein dynamic interface banao`}],a:1,w:{en:`The APs have IP addresses but no controller address, and broadcast discovery cannot reach a WLC in another subnet. Option 43 (type f1, length 04, 0a0a630a = 10.10.99.10) gives them the controller. Option 150 is for IP phones; trunks or a VLAN 10 interface do not help discovery.`,hi:`APs ke paas IP addresses hain par controller address nahi, aur broadcast discovery doosre subnet ke WLC tak nahi pahunch sakti. Option 43 (type f1, length 04, 0a0a630a = 10.10.99.10) unhe controller deta hai. Option 150 IP phones ke liye hai; trunks ya VLAN 10 interface discovery mein madad nahi karte.`}},{title:{en:`Option 43 is there, APs still stuck`,hi:`Option 43 hai, phir bhi APs atke hue`},ticket:{en:`A junior engineer "already added option 43" but the APs still do not join. Nothing else changed.`,hi:`Ek junior engineer ne "option 43 pehle hi jod diya" lekin APs abhi bhi join nahi karte. Aur kuch nahi badla.`},out:`R1# show running-config | section ip dhcp pool AP-POOL
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 option 43 hex f104.0a0a.6301

AP1> show capwap
AP name                  : AP1
AP IP address            : 10.10.10.11/24 (DHCP)
DHCP option 43           : 10.10.99.1
CAPWAP state             : DISCOVERY - no controller answered`,q:{en:`Why are the APs not joining?`,hi:`APs join kyun nahi kar rahe?`},o:[{en:`Option 43 must use the ascii keyword, not hex`,hi:`Option 43 mein hex nahi, ascii keyword hona chahiye`},{en:`The length byte must be 01 for one controller`,hi:`Ek controller ke liye length byte 01 hona chahiye`},{en:`CAPWAP needs TCP 5246 opened on R1`,hi:`CAPWAP ke liye R1 par TCP 5246 kholna padega`},{en:`The last byte is wrong: 01 points to 10.10.99.1 (the gateway); it must be 0a for 10.10.99.10`,hi:`Aakhri byte galat hai: 01 10.10.99.1 (gateway) ki taraf point karta hai; 10.10.99.10 ke liye 0a hona chahiye`}],a:3,w:{en:`The AP learned 10.10.99.1, R1's own address, which does not answer CAPWAP. 10 decimal is 0a hex, so the value must be f104.0a0a.630a. Cisco APs expect the hex TLV, the length is 4 bytes per address, and CAPWAP is UDP.`,hi:`AP ne 10.10.99.1 seekha, jo R1 ka apna address hai aur CAPWAP ka jawab nahi deta. Decimal 10 hex mein 0a hai, isliye value f104.0a0a.630a honi chahiye. Cisco APs hex TLV expect karte hain, length har address ke 4 bytes hai, aur CAPWAP UDP hai.`}},{title:{en:`Visitors reach the file server`,hi:`Visitors file server tak pahunchte hain`},ticket:{en:`Audit finding: a phone on NK-GUEST opened SRV1 (10.10.50.10). Guests should be in VLAN 30 (10.10.30.0/24) behind ACL GUEST-IN on R1. The guest interface on WLC1 has already been confirmed as VLAN 30.`,hi:`Audit finding: NK-GUEST par ek phone ne SRV1 (10.10.50.10) khola. Guests ko VLAN 30 (10.10.30.0/24) mein R1 ke ACL GUEST-IN ke peeche hona chahiye. WLC1 par guest interface ka VLAN 30 hona pehle hi confirm ho chuka hai.`},out:`(WLC1) >show wlan summary

Number of WLANs.................................. 2

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
1        STAFF / NK-STAFF                  Enabled   staff             WPA2-Personal (PSK)
3        GUEST / NK-GUEST                  Enabled   staff             Open

PHONE1> wifi status
SSID        : NK-GUEST
Security    : Open
IP address  : 10.10.20.22/24 (DHCP)`,q:{en:`Which change closes the audit finding?`,hi:`Kaunsa change audit finding band karega?`},o:[{en:`config wlan interface 3 guest`,hi:`config wlan interface 3 guest`},{en:`config wlan broadcast-ssid disable 3`,hi:`config wlan broadcast-ssid disable 3`},{en:`Apply ACL GUEST-IN to R1 Gi0/0.20 as well`,hi:`ACL GUEST-IN ko R1 Gi0/0.20 par bhi laga do`},{en:`Enable WPA2-PSK on WLAN 3`,hi:`WLAN 3 par WPA2-PSK enable karo`}],a:0,w:{en:`WLAN 3 is mapped to the staff interface, so guests get 10.10.20.x staff addresses and never pass through the guest ACL. Mapping it to the guest interface puts them in VLAN 30. Hiding the SSID or adding a key does not isolate anyone, and filtering the staff VLAN would break staff.`,hi:`WLAN 3 staff interface se mapped hai, isliye guests ko 10.10.20.x staff addresses milte hain aur woh kabhi guest ACL se nahi guzarte. Use guest interface se map karne se woh VLAN 30 mein aate hain. SSID chhupana ya key jodna kisi ko isolate nahi karta, aur staff VLAN filter karna staff ko tod dega.`}},{title:{en:`802.1X logins fail with timeouts`,hi:`802.1X logins timeouts ke saath fail`},ticket:{en:`NK-CORP was just built. Every login fails. RAD1 (10.10.50.20) is pingable from WLC1. The RADIUS admin says the WLC is registered as client 10.10.40.5 with secret NkRadius1, and RAD1's log shows nothing.`,hi:`NK-CORP abhi bana hai. Har login fail hota hai. RAD1 (10.10.50.20) WLC1 se ping ho raha hai. RADIUS admin kehta hai WLC client 10.10.40.5 ke roop mein secret NkRadius1 ke saath registered hai, aur RAD1 ka log kuch nahi dikhata.`},out:`(WLC1) >show radius summary

Authentication Servers

Idx  Server Address   Port   State     Requests  Timeouts
---  ---------------  -----  --------  --------  --------
1    10.10.50.20      1812   Enabled   6         6

(WLC1) >show interface summary

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
management            1     99        10.10.99.10      Static   Yes     No
corp                  1     40        10.10.40.5       Dynamic  No      No
virtual               N/A   N/A       192.0.2.1        Static   No      No`,q:{en:`What should be fixed?`,hi:`Kya fix karna chahiye?`},o:[{en:`Change the RADIUS port on the WLC to 1813`,hi:`WLC par RADIUS port 1813 kar do`},{en:`Switch NK-CORP to WPA2-PSK`,hi:`NK-CORP ko WPA2-PSK par switch karo`},{en:`Register the WLC on RAD1 as 10.10.99.10 (its management IP) with the same secret`,hi:`RAD1 par WLC ko 10.10.99.10 (uska management IP) ke roop mein same secret ke saath register karo`},{en:`Move the corp interface to VLAN 99`,hi:`Corp interface ko VLAN 99 mein le jaao`}],a:2,w:{en:`RADIUS requests are sourced from the WLC management interface, 10.10.99.10. RAD1 does not know that client, so it drops every request silently: requests equal timeouts. 1813 is accounting, and changing security or VLANs avoids the real fault.`,hi:`RADIUS requests WLC ke management interface, 10.10.99.10, se source hoti hain. RAD1 us client ko nahi jaanta, isliye har request chupchaap drop karta hai: requests timeouts ke barabar hain. 1813 accounting hai, aur security ya VLANs badalna asli fault se bachna hai.`}},{title:{en:`Authenticated, but 169.254 addresses`,hi:`Authenticated, lekin 169.254 addresses`},ticket:{en:`After a weekend switch change, users on NK-CORP (interface corp) authenticate fine but receive 169.254.x.x addresses. NK-STAFF users are fine.`,hi:`Weekend ke switch change ke baad NK-CORP (interface corp) ke users theek se authenticate hote hain lekin 169.254.x.x addresses paate hain. NK-STAFF users theek hain.`},out:`(WLC1) >show interface summary

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
management            1     99        10.10.99.10      Static   Yes     No
staff                 1     20        10.10.20.5       Dynamic  No      No
corp                  1     40        10.10.40.5       Dynamic  No      No
virtual               N/A   N/A       192.0.2.1        Static   No      No

SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       20,30,99`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Change the AP ports to trunks allowing VLAN 40`,hi:`AP ports ko VLAN 40 allow karne wale trunks banao`},{en:`On SW1 Gi0/1: switchport trunk allowed vlan add 40`,hi:`SW1 Gi0/1 par: switchport trunk allowed vlan add 40`},{en:`Re-enter the RADIUS shared secret`,hi:`RADIUS shared secret dobara daalo`},{en:`Change the corp interface to VLAN 20`,hi:`Corp interface ko VLAN 20 kar do`}],a:1,w:{en:`Authentication works, so RADIUS and the WLAN are fine. Frames tagged 40 from the WLC are dropped because VLAN 40 is no longer allowed on the WLC trunk. Adding it back restores DHCP. Local-mode AP ports stay access ports, and moving corp into VLAN 20 would merge it with staff.`,hi:`Authentication chal raha hai, isliye RADIUS aur WLAN theek hain. WLC ke 40 tagged frames drop ho rahe hain kyunki VLAN 40 ab WLC trunk par allowed nahi hai. Use wapas jodne se DHCP laut aata hai. Local-mode AP ports access ports hi rehte hain, aur corp ko VLAN 20 mein daalna use staff ke saath mila dega.`}},{title:{en:`Old laptops cannot join the new secure WLAN`,hi:`Purane laptops naye secure WLAN ko join nahi kar paate`},ticket:{en:`IT built NK-SECURE (WLAN 4) for staff. New laptops connect fine. Several older laptops and scanners that support only WPA2 cannot join. Management wants one SSID for everybody during the migration.`,hi:`IT ne staff ke liye NK-SECURE (WLAN 4) banaya. Naye laptops theek connect hote hain. Kai purane laptops aur scanners jo sirf WPA2 support karte hain join nahi kar paate. Management migration ke dauraan sabke liye ek hi SSID chahta hai.`},out:`(WLC1) >show wlan 4

WLAN Identifier.................................. 4
Network Name (SSID).............................. NK-SECURE
Status........................................... Enabled
Interface........................................ staff
   Wi-Fi Protected Access (WPA/WPA2/WPA3)........ Enabled
      WPA2 (RSN IE).............................. Disabled
      WPA3 (SAE capable)......................... Enabled
      Auth Key Management
         802.1X.................................. Disabled
         PSK..................................... Disabled
         SAE..................................... Enabled

Security Summary................................. [WPA3][Auth(SAE)]`,q:{en:`What should the engineer configure?`,hi:`Engineer ko kya configure karna chahiye?`},o:[{en:`Disable WPA on WLAN 4 so every device can connect`,hi:`WLAN 4 par WPA disable karo taaki har device connect ho sake`},{en:`Enable 802.1X on WLAN 4 and keep SAE`,hi:`WLAN 4 par 802.1X enable karo aur SAE rakho`},{en:`Hide the SSID from the old devices`,hi:`Purane devices se SSID chhupao`},{en:`Transition mode: also enable WPA2 and AKM PSK on WLAN 4 alongside WPA3/SAE`,hi:`Transition mode: WLAN 4 par WPA3/SAE ke saath WPA2 aur AKM PSK bhi enable karo`}],a:3,w:{en:`WPA3 transition mode lets WPA3-capable clients use SAE while WPA2-only clients use PSK on the same SSID (PMF becomes optional). Opening the WLAN removes security, 802.1X needs RADIUS and user accounts, and hiding the SSID changes nothing for compatibility.`,hi:`WPA3 transition mode WPA3-capable clients ko SAE aur WPA2-only clients ko PSK use karne deta hai, same SSID par (PMF optional ho jaata hai). WLAN kholna security hata deta hai, 802.1X ko RADIUS aur user accounts chahiye, aur SSID chhupane se compatibility mein kuch nahi badalta.`}},{title:{en:`Controller uplink bundle stays down`,hi:`Controller ka uplink bundle down rehta hai`},ticket:{en:`A new AireOS controller with LAG enabled was cabled to two switch ports. The APs cannot reach it and the port-channel is down.`,hi:`LAG enabled wala naya AireOS controller do switch ports se cable kiya gaya. APs usse nahi pahunch paate aur port-channel down hai.`},out:`SW2# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        S - Layer2      U - in use

Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SD)         LACP      Gi1/0/1(s)  Gi1/0/2(s)

SW2# show running-config interface GigabitEthernet1/0/1
interface GigabitEthernet1/0/1
 switchport mode trunk
 channel-group 1 mode active`,q:{en:`What change brings the bundle up?`,hi:`Kaunsa change bundle ko up karega?`},o:[{en:`Use channel-group 1 mode on on both switch ports`,hi:`Dono switch ports par channel-group 1 mode on use karo`},{en:`Use channel-group 1 mode desirable (PAgP)`,hi:`channel-group 1 mode desirable (PAgP) use karo`},{en:`Change both ports to access mode in VLAN 99`,hi:`Dono ports ko VLAN 99 mein access mode kar do`},{en:`Disable LAG and leave only one cable connected`,hi:`LAG disable karo aur sirf ek cable jodi rakho`}],a:0,w:{en:`AireOS LAG is static only and never sends LACP or PAgP, so the switch suspends ports waiting for a negotiating partner. Mode on matches the controller. The WLC ports must remain trunks, and removing redundancy is not a fix.`,hi:`AireOS LAG sirf static hai aur kabhi LACP ya PAgP nahi bhejta, isliye switch negotiate karne wale partner ka wait karte hue ports suspend kar deta hai. Mode on controller se match karta hai. WLC ports trunks hi rehne chahiye, aur redundancy hatana fix nahi hai.`}},{title:{en:`Audit: controller management is insecure`,hi:`Audit: controller management insecure hai`},ticket:{en:`An auditor captured an administrator's password in clear text on the network while he logged in to WLC1. The company wants encrypted management only, with no loss of GUI or CLI access.`,hi:`Ek auditor ne network par ek administrator ka password clear text mein capture kiya jab woh WLC1 mein login kar raha tha. Company sirf encrypted management chahti hai, GUI ya CLI access khoye bina.`},out:`(WLC1) >show network summary
...
Web Mode......................................... Enable
Secure Web Mode.................................. Disable
Secure Shell (ssh)............................... Disable
Telnet........................................... Enable
Mgmt Via Wireless Interface...................... Enable
...`,q:{en:`Which set of changes meets the requirement?`,hi:`Kaunse changes requirement poori karte hain?`},o:[{en:`Disable Telnet only; HTTP is safe inside the LAN`,hi:`Sirf Telnet disable karo; LAN ke andar HTTP safe hai`},{en:`Disable both web modes and use only the console`,hi:`Dono web modes disable karo aur sirf console use karo`},{en:`Enable secure web and SSH, disable web mode and Telnet, and disable management via wireless`,hi:`Secure web aur SSH enable karo, web mode aur Telnet disable karo, aur management via wireless disable karo`},{en:`Change the admin password every week`,hi:`Har hafte admin password badlo`}],a:2,w:{en:`HTTP (TCP 80) and Telnet (TCP 23) send credentials in clear text. HTTPS and SSH keep GUI and CLI access with encryption, and blocking management via wireless reduces exposure. Console-only removes remote access; password rotation does not stop sniffing.`,hi:`HTTP (TCP 80) aur Telnet (TCP 23) credentials clear text mein bhejte hain. HTTPS aur SSH encryption ke saath GUI aur CLI access rakhte hain, aur management via wireless block karna exposure kam karta hai. Sirf console remote access hata deta hai; password rotation sniffing nahi rokta.`}}];export{e as default};