var e=[{title:{en:`The new switch that took over`,hi:`Naya switch jisne sab le liya`},ticket:{en:`Ticket from Vardhan Textiles: "Since the store room switch was installed on Monday, all VLAN 10 traffic between floors is slow." You check the core distribution switch DSW1, which is supposed to be root.`,hi:`Vardhan Textiles ka ticket: "Monday ko store room switch lagne ke baad se floors ke beech VLAN 10 ka saara traffic slow hai." Aap core distribution switch DSW1 check karte ho, jise root hona chahiye.`},out:`DSW1#show spanning-tree vlan 10 | begin Root ID
  Root ID    Priority    32778
             Address     0019.e84a.1100
             Cost        8
             Port        3 (GigabitEthernet1/0/3)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     70d3.79be.4400
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

DSW1#show cdp neighbors Gi1/0/3 | include STORE
STORE-SW1        Gig 1/0/3         151              S I   WS-C2960  Gig 0/1`,q:{en:`Why did the store room switch become root, and what is the right fix?`,hi:`Store room switch root kyun ban gaya, aur sahi fix kya hai?`},o:[{en:`It runs a different STP mode; change DSW1 to pvst`,hi:`Woh alag STP mode chala raha hai; DSW1 ko pvst kar do`},{en:`Priorities tie at 32778 and its MAC is lower; set spanning-tree vlan 10 root primary (or a low explicit priority) on DSW1 and add Root Guard on the downlinks`,hi:`Priority 32778 par tie hai aur uska MAC chhota hai; DSW1 par spanning-tree vlan 10 root primary (ya low explicit priority) set karo aur downlinks par Root Guard lagao`},{en:`Its uplink cost is lower; raise the cost on Gi1/0/3`,hi:`Uska uplink cost kam hai; Gi1/0/3 par cost badhao`},{en:`Enable BPDU Guard on DSW1 Gi1/0/3`,hi:`DSW1 Gi1/0/3 par BPDU Guard enable karo`}],a:1,w:{en:`Both switches use the default priority, so the lowest MAC wins, and 0019.e84a... is lower than 70d3.79be.... Cost never decides the root. BPDU Guard on a switch-to-switch link would just err-disable the store room. A lower priority on DSW1 restores the design; Root Guard stops it recurring.`,hi:`Dono switches default priority use kar rahe hain, isliye sabse chhota MAC jeetta hai, aur 0019.e84a... 70d3.79be... se chhota hai. Cost kabhi root decide nahi karti. Switch-to-switch link par BPDU Guard store room ko bas err-disable kar dega. DSW1 par kam priority design wapas laati hai; Root Guard ise dobara hone se rokta hai.`}},{title:{en:`A desk port goes dark`,hi:`Desk port band ho gaya`},ticket:{en:`Ticket from Kaveri Fintech: "Desk 3-14 has no network after the analyst brought a small switch from home for a second monitor dock." You check the access switch.`,hi:`Kaveri Fintech ka ticket: "Analyst second monitor dock ke liye ghar se chhota switch laaya, uske baad Desk 3-14 par network nahi hai." Aap access switch check karte ho.`},out:`*Sep 27 09:41:22.108: %SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi1/0/14 with BPDU Guard enabled. Disabling port.
*Sep 27 09:41:22.111: %PM-4-ERR_DISABLE: bpduguard error detected on Gi1/0/14, putting Gi1/0/14 in err-disable state

ASW3#show interfaces status err-disabled

Port         Name               Status       Reason               Err-disabled Vlans
Gi1/0/14     DESK-3-14          err-disabled bpduguard`,q:{en:`What is the correct way to restore service?`,hi:`Service restore karne ka sahi tareeka kya hai?`},o:[{en:`Remove spanning-tree bpduguard enable from Gi1/0/14`,hi:`Gi1/0/14 se spanning-tree bpduguard enable hata do`},{en:`Disable spanning tree on VLAN 10`,hi:`VLAN 10 par spanning tree band kar do`},{en:`Remove the home switch, then shutdown and no shutdown Gi1/0/14`,hi:`Ghar wala switch hatao, phir Gi1/0/14 par shutdown aur no shutdown karo`},{en:`Wait; the port recovers by itself when BPDUs stop`,hi:`Wait karo; BPDUs rukte hi port khud recover ho jaayega`}],a:2,w:{en:`BPDU Guard did its job: a switch sent BPDUs into a host port. Err-disabled ports do not recover on their own unless errdisable recovery is configured; recovering by itself is Root Guard behaviour. Removing the protection or STP would invite a loop.`,hi:`BPDU Guard ne apna kaam kiya: host port par switch ne BPDUs bheje. Err-disabled ports tab tak khud recover nahi hote jab tak errdisable recovery configure na ho; khud recover hona Root Guard ka behaviour hai. Protection ya STP hatane se loop ka khatra hai.`}},{title:{en:`Everything down at once`,hi:`Sab kuch ek saath down`},ticket:{en:`Ticket from Sahyadri Hospitals: "The whole OPD block lost network at 11:02. All switch lights are blinking together." A contractor re-patched the OPD rack that morning. You log in to ASW-OPD.`,hi:`Sahyadri Hospitals ka ticket: "11:02 par poore OPD block ka network chala gaya. Switch ki saari lights ek saath blink kar rahi hain." Ek contractor ne subah OPD rack re-patch kiya tha. Aap ASW-OPD par login karte ho.`},out:`*Sep 27 11:02:14.227: %SW_MATM-4-MACFLAP_NOTIF: Host 5254.00c1.0a01 in vlan 10 is flapping between port Gi1/0/23 and port Gi1/0/24
*Sep 27 11:02:14.901: %SW_MATM-4-MACFLAP_NOTIF: Host 0050.56a1.3302 in vlan 10 is flapping between port Gi1/0/24 and port Gi1/0/23

ASW-OPD#show running-config interface Gi1/0/23
interface GigabitEthernet1/0/23
 switchport access vlan 10
 switchport mode access
 spanning-tree portfast
 spanning-tree bpdufilter enable
!
ASW-OPD#show running-config interface Gi1/0/24
interface GigabitEthernet1/0/24
 switchport access vlan 10
 switchport mode access
 spanning-tree portfast
 spanning-tree bpdufilter enable`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`PortFast moved the ports to forwarding too quickly`,hi:`PortFast ne ports ko bahut jaldi forwarding mein daal diya`},{en:`Duplicate IP addresses in VLAN 10`,hi:`VLAN 10 mein duplicate IP addresses`},{en:`The root bridge failed`,hi:`Root bridge fail ho gaya`},{en:`Gi1/0/23 and Gi1/0/24 are patched into the same loop, and interface-level BPDU Filter stops STP from ever seeing or blocking it`,hi:`Gi1/0/23 aur Gi1/0/24 same loop mein patch hain, aur interface-level BPDU Filter STP ko use kabhi dekhne ya block karne nahi deta`}],a:3,w:{en:`The same MACs flap between exactly these two ports, so frames are looping through them. Interface-level bpdufilter means neither port sends nor processes BPDUs, so STP cannot detect the loop. PortFast alone would have lost edge status on the first BPDU. Remove bpdufilter, enable BPDU Guard, and fix the patching.`,hi:`Same MACs bilkul inhi do ports ke beech flap ho rahe hain, yaani frames inke through loop kar rahe hain. Interface-level bpdufilter ka matlab dono ports na BPDU bhejte hain na process karte hain, isliye STP loop detect nahi kar sakta. Sirf PortFast hota to pehle BPDU par edge status chala jaata. bpdufilter hatao, BPDU Guard lagao aur patching theek karo.`}},{title:{en:`Blocked downlink`,hi:`Blocked downlink`},ticket:{en:`Ticket from Indus Logistics: "Warehouse switch WH-SW2 lost its link to DSW1 in VLAN 10 after the warehouse team tried to make WH-SW2 root for their own VLANs." You check DSW1.`,hi:`Indus Logistics ka ticket: "Warehouse team ne WH-SW2 ko apne VLANs ka root banane ki koshish ki, uske baad VLAN 10 mein WH-SW2 ka DSW1 se link chala gaya." Aap DSW1 check karte ho.`},out:`*Sep 27 14:37:09.552: %SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port GigabitEthernet1/0/10 on VLAN0010.

DSW1#show spanning-tree inconsistentports

Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0010             GigabitEthernet1/0/10    Root Inconsistent

Number of inconsistent ports (segments) in the system : 1`,q:{en:`What is happening, and how does the port come back?`,hi:`Kya ho raha hai, aur port wapas kaise aayega?`},o:[{en:`WH-SW2 is sending superior BPDUs; once its priority is set back, DSW1 Gi1/0/10 recovers automatically`,hi:`WH-SW2 superior BPDUs bhej raha hai; uski priority wapas set karte hi DSW1 Gi1/0/10 khud recover ho jaayega`},{en:`The port is err-disabled; shutdown and no shutdown it`,hi:`Port err-disabled hai; shutdown aur no shutdown karo`},{en:`The link is unidirectional; replace the fibre`,hi:`Link unidirectional hai; fibre badlo`},{en:`Root Guard must be removed from Gi1/0/10`,hi:`Gi1/0/10 se Root Guard hatana padega`}],a:0,w:{en:`Root Guard blocks a designated port that receives a superior BPDU and marks it Root Inconsistent. It is not err-disable, so no bounce is needed, and it is not Loop Guard (which would say Loop Inconsistent). Undo the priority change on WH-SW2 and the port forwards again.`,hi:`Root Guard us designated port ko block karta hai jis par superior BPDU aata hai aur use Root Inconsistent mark karta hai. Yeh err-disable nahi hai, isliye bounce ki zaroorat nahi, aur Loop Guard bhi nahi hai (woh Loop Inconsistent dikhata). WH-SW2 par priority change undo karo aur port phir forward karega.`}},{title:{en:`The higher port won`,hi:`Bada port jeet gaya`},ticket:{en:`Ticket from Prayag Media: "ACC-SW2 has two cables to DIST-SW1 (root). A junior engineer expected Gi0/1 to be the root port because it has the lower number, but Gi0/2 is forwarding." You collect this.`,hi:`Prayag Media ka ticket: "ACC-SW2 ke DIST-SW1 (root) tak do cables hain. Junior engineer ko laga Gi0/1 root port hoga kyunki uska number chhota hai, lekin Gi0/2 forward kar raha hai." Aap yeh collect karte ho.`},out:`DIST-SW1#show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Desg FWD 4         128.2    P2p
Gi0/2               Desg FWD 4         64.3     P2p

ACC-SW2#show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Altn BLK 4         128.2    P2p
Gi0/2               Root FWD 4         128.3    P2p

! Cabling: DIST-SW1 Gi0/1 to ACC-SW2 Gi0/1, DIST-SW1 Gi0/2 to ACC-SW2 Gi0/2`,q:{en:`Why is ACC-SW2 Gi0/2 the root port?`,hi:`ACC-SW2 Gi0/2 root port kyun hai?`},o:[{en:`Gi0/2 has a lower cost`,hi:`Gi0/2 ki cost kam hai`},{en:`ACC-SW2 prefers the higher local port number`,hi:`ACC-SW2 bada local port number prefer karta hai`},{en:`Cost and neighbour BID tie, so ACC-SW2 compares the sender port ID: DIST-SW1 Gi0/2 advertises 64.3, lower than 128.2`,hi:`Cost aur neighbour BID tie hain, isliye ACC-SW2 sender port ID compare karta hai: DIST-SW1 Gi0/2 64.3 advertise karta hai, jo 128.2 se kam hai`},{en:`Gi0/1 is err-disabled`,hi:`Gi0/1 err-disabled hai`}],a:2,w:{en:`Both links cost 4 and lead to the same neighbour, so the tie-breaker is the neighbour's port ID carried in its BPDU. Someone set port-priority 64 on DIST-SW1 Gi0/2. The local port number matters only if the sender port IDs also tie, and an err-disabled port would not appear as Altn BLK.`,hi:`Dono links ki cost 4 hai aur same neighbour tak jaate hain, isliye tie-breaker neighbour ka port ID hai jo uske BPDU mein aata hai. Kisi ne DIST-SW1 Gi0/2 par port-priority 64 set ki hai. Local port number tabhi matter karta hai jab sender port IDs bhi tie hon, aur err-disabled port Altn BLK nahi dikhta.`}},{title:{en:`The idle uplink at Nilgiri Logistics`,hi:`Nilgiri Logistics ka idle uplink`},ticket:{en:`Ticket from Nilgiri Logistics: "VLAN 10 users on SW3 are slow and the SW1 uplink graph is flat." The design says SW1 is root for VLAN 10 and SW3 Gi0/1 (to SW1) is its root port.`,hi:`Nilgiri Logistics ka ticket: "SW3 par VLAN 10 users slow hain aur SW1 uplink ka graph flat hai." Design kehta hai ki SW1 VLAN 10 ka root hai aur SW3 Gi0/1 (SW1 ki taraf) uska root port hai.`},out:`SW3#show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     5254.0023.a200
             Cost        8
             Port        3 (GigabitEthernet0/2)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     5254.fe23.9f00
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Altn BLK 19        128.2    P2p
Gi0/2               Root FWD 4         128.3    P2p
Gi0/5               Desg FWD 4         128.6    P2p Edge`,q:{en:`What is the most likely cause and fix?`,hi:`Sabse likely cause aur fix kya hai?`},o:[{en:`A manual cost of 19 on SW3 Gi0/1 makes the path via SW2 (4 + 4 = 8) cheaper; remove it with no spanning-tree vlan 10 cost`,hi:`SW3 Gi0/1 par manual cost 19 SW2 ke through path (4 + 4 = 8) ko sasta bana deti hai; ise no spanning-tree vlan 10 cost se hatao`},{en:`SW2 has become root for VLAN 10; set root primary on SW1`,hi:`SW2 VLAN 10 ka root ban gaya hai; SW1 par root primary set karo`},{en:`Gi0/1 is a FastEthernet port; replace the cable`,hi:`Gi0/1 FastEthernet port hai; cable badlo`},{en:`Root Guard on SW1 is blocking the link`,hi:`SW1 par Root Guard link block kar raha hai`}],a:0,w:{en:`The Root ID shows SW1's MAC with priority 24586, so the root is correct. Gi0/1's cost of 19 is the FastEthernet value on a gigabit trunk, typically left by an old template command. Via Gi0/1 the cost is 19, via Gi0/2 it is 8, so Gi0/2 wins. Root Guard would show Root Inconsistent, not Altn BLK.`,hi:`Root ID SW1 ka MAC priority 24586 ke saath dikhata hai, isliye root sahi hai. Gi0/1 ki cost 19 gigabit trunk par FastEthernet wali value hai, aam taur par purane template command ki chhodi hui. Gi0/1 se cost 19 hai, Gi0/2 se 8, isliye Gi0/2 jeetta hai. Root Guard hota to Root Inconsistent dikhta, Altn BLK nahi.`}},{title:{en:`Floods every few minutes`,hi:`Har kuch minute mein flooding`},ticket:{en:`Ticket from Tapti Finance: "Every few minutes the whole VLAN 10 sees a burst of flooded traffic and the IP phones glitch." Nothing is down and the root is correct. You check the access switch.`,hi:`Tapti Finance ka ticket: "Har kuch minute mein poore VLAN 10 mein flooded traffic ka burst aata hai aur IP phones glitch karte hain." Kuch bhi down nahi hai aur root sahi hai. Aap access switch check karte ho.`},out:`ASW2#show spanning-tree vlan 10 detail | include occurr|from
  Number of topology changes 412 last change occurred 00:02:05 ago
          from GigabitEthernet1/0/8

ASW2#show running-config interface Gi1/0/8
interface GigabitEthernet1/0/8
 description KIOSK-PC-LOBBY
 switchport access vlan 10
 switchport mode access
!
ASW2#show logging | include Gi1/0/8
%LINK-3-UPDOWN: Interface GigabitEthernet1/0/8, changed state to down
%LINK-3-UPDOWN: Interface GigabitEthernet1/0/8, changed state to up`,q:{en:`What is the best fix?`,hi:`Sabse accha fix kya hai?`},o:[{en:`Raise the MAC aging time to 900 seconds`,hi:`MAC aging time 900 second kar do`},{en:`Make ASW2 the root bridge for VLAN 10`,hi:`ASW2 ko VLAN 10 ka root bridge banao`},{en:`Enable BPDU Filter on all uplinks`,hi:`Saare uplinks par BPDU Filter enable karo`},{en:`Configure spanning-tree portfast and bpduguard on Gi1/0/8 so the flapping kiosk port no longer generates topology changes`,hi:`Gi1/0/8 par spanning-tree portfast aur bpduguard configure karo taaki flap hota kiosk port topology changes generate na kare`}],a:3,w:{en:`The kiosk PC's port flaps, and because it is not an edge port each transition to forwarding triggers a topology change that flushes MAC tables across the VLAN, causing flooding. PortFast makes it an edge port that never generates TCs; BPDU Guard keeps it safe. Moving the root or filtering uplink BPDUs would be harmful.`,hi:`Kiosk PC ka port flap karta hai, aur kyunki yeh edge port nahi hai, forwarding mein har transition topology change trigger karta hai jo poore VLAN mein MAC tables flush karta hai, jisse flooding hoti hai. PortFast ise edge port banata hai jo kabhi TCs generate nahi karta; BPDU Guard ise safe rakhta hai. Root hilana ya uplink BPDUs filter karna nuksaan karega.`}},{title:{en:`One-way fibre`,hi:`Ek taraf ka fibre`},ticket:{en:`Ticket from Godavari Ports: "After a fibre patch was cleaned in the yard cabinet, the yard switch logged a loop guard message and VLAN 30 traffic now goes the long way." Loop Guard is enabled globally.`,hi:`Godavari Ports ka ticket: "Yard cabinet mein fibre patch saaf hone ke baad yard switch ne loop guard message log kiya aur VLAN 30 traffic ab lamba raasta le raha hai." Loop Guard globally enabled hai.`},out:`%SPANTREE-2-LOOPGUARD_BLOCK: Loop guard blocking port TenGigabitEthernet1/1/1 on VLAN0030.

YARD-SW#show spanning-tree inconsistentports

Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0030             TenGigabitEthernet1/1/1  Loop Inconsistent

Number of inconsistent ports (segments) in the system : 1

YARD-SW#show interfaces Te1/1/1 | include line protocol
TenGigabitEthernet1/1/1 is up, line protocol is up (connected)`,q:{en:`What does this tell you?`,hi:`Isse aapko kya pata chalta hai?`},o:[{en:`A switch with a better Bridge ID was connected on Te1/1/1`,hi:`Te1/1/1 par better Bridge ID wala switch connect hua`},{en:`BPDUs stopped arriving on a root or alternate port while the link stayed up, likely a one-way fibre; Loop Guard blocked it to prevent a loop, and it will recover when BPDUs return`,hi:`Link up rehte hue root ya alternate port par BPDUs aana band ho gaye, shayad one-way fibre; Loop Guard ne loop rokne ke liye use block kiya, aur BPDUs wapas aane par recover ho jaayega`},{en:`The port is err-disabled and must be bounced`,hi:`Port err-disabled hai aur use bounce karna padega`},{en:`PortFast was enabled on the uplink by mistake`,hi:`Galti se uplink par PortFast enable ho gaya`}],a:1,w:{en:`Loop Inconsistent means BPDUs stopped on a non-designated port that is still up, which is the signature of a unidirectional link. Without Loop Guard the port would have aged out the information, become designated and forwarded, creating a loop. Fix the fibre (clean or replace the pair); the port unblocks automatically. A superior BPDU would give Root Inconsistent instead.`,hi:`Loop Inconsistent ka matlab hai ki up hone ke bawajood non-designated port par BPDUs ruk gaye, jo unidirectional link ki pehchaan hai. Loop Guard ke bina port information age out karke designated ban jaata aur forward karta, jisse loop banta. Fibre theek karo (pair saaf karo ya badlo); port apne aap unblock hoga. Superior BPDU hota to Root Inconsistent dikhta.`}}];export{e as default};