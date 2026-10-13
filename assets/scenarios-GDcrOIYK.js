var e=[{title:{en:`The CCTV VLAN that broke Accounts and HR`,hi:`CCTV VLAN jisne Accounts aur HR tod diya`},ticket:{en:`Kavya Textiles, Surat. Last night an engineer added VLAN 50 (CCTV) to the uplink Gi0/48 on ACC-SW2. This morning Accounts (VLAN 10) and HR (VLAN 20) on that switch cannot reach the server farm. The cameras work.`,hi:`Kavya Textiles, Surat. Kal raat ek engineer ne ACC-SW2 ke uplink Gi0/48 par VLAN 50 (CCTV) add kiya. Aaj subah us switch par Accounts (VLAN 10) aur HR (VLAN 20) server farm tak nahi pahunch pa rahe. Cameras chal rahe hain.`},out:`ACC-SW2#show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/48      on               802.1q         trunking      999

Port        Vlans allowed on trunk
Gi0/48      50

Port        Vlans allowed and active in management domain
Gi0/48      50

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/48      50

ACC-SW2#show archive log config all | include allowed
   14  1   admin@vty0   |  switchport trunk allowed vlan 50`,q:{en:`What is the root cause and the correct fix?`,hi:`Root cause kya hai aur sahi fix kya hai?`},o:[{en:`Native VLAN mismatch; set the native VLAN to 1 on Gi0/48`,hi:`Native VLAN mismatch; Gi0/48 par native VLAN 1 set karo`},{en:`STP is blocking VLANs 10 and 20; clear spanning tree on the uplink`,hi:`STP VLANs 10 aur 20 block kar raha hai; uplink par spanning tree clear karo`},{en:`The command without "add" replaced the list; restore it, e.g. switchport trunk allowed vlan 10,20,50,999`,hi:`"add" ke bina command ne list replace kar di; restore karo, jaise switchport trunk allowed vlan 10,20,50,999`},{en:`The trunk encapsulation is wrong; change it to ISL`,hi:`Trunk encapsulation galat hai; ISL karo`}],a:2,w:{en:`The archive log shows "allowed vlan 50" without add, so the list became just 50. Restore the full list (or add 10,20,999 back). STP is not the cause: VLANs 10 and 20 are not even in the allowed list, and the native VLAN is 999 as designed.`,hi:`Archive log mein add ke bina "allowed vlan 50" hai, isliye list sirf 50 reh gayi. Poori list restore karo (ya 10,20,999 wapas add karo). STP cause nahi hai: VLANs 10 aur 20 allowed list mein hi nahi hain, aur native VLAN design ke hisaab se 999 hai.`}},{title:{en:`Management unreachable after re-cabling`,hi:`Re-cabling ke baad management unreachable`},ticket:{en:`Orbit Logistics, Pune. Since a trunk was re-cabled to a new core port, the NOC cannot reach the management IP of DIST-SW1 (management uses VLAN 900). User VLANs on DIST-SW1 are fine.`,hi:`Orbit Logistics, Pune. Jab se trunk naye core port par re-cable hua, NOC DIST-SW1 ke management IP tak nahi pahunch pa raha (management VLAN 900 use karta hai). DIST-SW1 ke user VLANs theek hain.`},out:`*Sep 27 10:41:07.318: %CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet1/0/24 (1), with CORE-SW1 GigabitEthernet1/0/3 (900).
*Sep 27 10:41:07.322: %SPANTREE-2-BLOCK_PVID_LOCAL: Blocking GigabitEthernet1/0/24 on VLAN0001. Inconsistent local vlan.
*Sep 27 10:41:07.322: %SPANTREE-2-BLOCK_PVID_PEER: Blocking GigabitEthernet1/0/24 on VLAN0900. Inconsistent peer vlan.

DIST-SW1#show interfaces GigabitEthernet1/0/24 switchport | include Native
Trunking Native Mode VLAN: 1 (default)
Administrative Native VLAN tagging: enabled`,q:{en:`What is the fix on DIST-SW1?`,hi:`DIST-SW1 par fix kya hai?`},o:[{en:`no vlan 1`,hi:`no vlan 1`},{en:`switchport trunk allowed vlan add 900`,hi:`switchport trunk allowed vlan add 900`},{en:`switchport mode dynamic desirable`,hi:`switchport mode dynamic desirable`},{en:`switchport trunk native vlan 900 on Gi1/0/24 (matching CORE-SW1)`,hi:`Gi1/0/24 par switchport trunk native vlan 900 (CORE-SW1 se match)`}],a:3,w:{en:`DIST-SW1 uses native 1, CORE-SW1 uses native 900. PVST+ blocks VLAN 1 and VLAN 900 on the port as PVID-inconsistent, which kills management. Match the native VLAN (and ideally move both ends to an unused native VLAN later). Adding 900 to the allowed list does not help, because the VLAN is blocked, not filtered. VLAN 1 cannot be deleted.`,hi:`DIST-SW1 native 1 use karta hai, CORE-SW1 native 900. PVST+ port par VLAN 1 aur VLAN 900 ko PVID-inconsistent ki tarah block karta hai, jisse management band. Native VLAN match karo (aur baad mein dono ends ko unused native VLAN par le jaana behtar hai). Allowed list mein 900 add karne se kuch nahi hoga, kyunki VLAN block hai, filter nahi. VLAN 1 delete nahi ho sakta.`}},{title:{en:`New switch, no trunk`,hi:`Naya switch, trunk nahi`},ticket:{en:`Sahyadri Hospitals, Nashik. A new access switch was connected to the distribution switch with default settings on both ports. PCs on the new switch in VLAN 20 get no DHCP address.`,hi:`Sahyadri Hospitals, Nashik. Naya access switch distribution switch se dono ports default settings par rakh kar joda gaya. Naye switch par VLAN 20 ke PCs ko DHCP address nahi mil raha.`},out:`ACC-NEW#show interfaces GigabitEthernet0/1 switchport
Name: Gi0/1
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)

ACC-NEW#show interfaces trunk
ACC-NEW#`,q:{en:`The distribution port shows exactly the same modes. Why is there no trunk?`,hi:`Distribution port par bhi bilkul same modes hain. Trunk kyun nahi bana?`},o:[{en:`VLAN 20 has not been created on ACC-NEW`,hi:`ACC-NEW par VLAN 20 bana hi nahi`},{en:`Both sides are dynamic auto, so neither side asks for a trunk`,hi:`Dono side dynamic auto hain, isliye koi side trunk nahi maangti`},{en:`The native VLAN does not match`,hi:`Native VLAN match nahi karta`},{en:`DTP is disabled on both ports`,hi:`Dono ports par DTP disabled hai`}],a:1,w:{en:`Negotiation of Trunking is On, so DTP runs, but auto + auto results in access. Configure both uplink ports with switchport mode trunk and switchport nonegotiate. A missing VLAN would not stop the link from trunking, and a native mismatch cannot exist on a link that is not a trunk.`,hi:`Negotiation of Trunking On hai, yaani DTP chal raha hai, par auto + auto ka result access hai. Dono uplink ports par switchport mode trunk aur switchport nonegotiate configure karo. Missing VLAN link ko trunking se nahi rokta, aur jo link trunk hi nahi uspar native mismatch ho hi nahi sakta.`}},{title:{en:`Allowed but not active`,hi:`Allowed lekin active nahi`},ticket:{en:`Zenith Fintech, Bengaluru. VLAN 60 (TRADING) was "added end to end" last night. Trading desks on FLR-SW4 still cannot reach their gateway on the core.`,hi:`Zenith Fintech, Bengaluru. VLAN 60 (TRADING) kal raat "end to end add" kiya gaya. FLR-SW4 par trading desks abhi bhi core par apne gateway tak nahi pahunch pa rahe.`},out:`FLR-SW4#show interfaces trunk | begin allowed on
Port        Vlans allowed on trunk
Gi1/0/48    10,20,60,999

Port        Vlans allowed and active in management domain
Gi1/0/48    10,20,999

Port        Vlans in spanning tree forwarding state and not pruned
Gi1/0/48    10,20,999

FLR-SW4#show vlan brief | include 60
FLR-SW4#`,q:{en:`What is missing on FLR-SW4?`,hi:`FLR-SW4 par kya missing hai?`},o:[{en:`The VLAN itself: vlan 60 with name TRADING`,hi:`VLAN khud: vlan 60, name TRADING ke saath`},{en:`switchport trunk allowed vlan add 60`,hi:`switchport trunk allowed vlan add 60`},{en:`switchport trunk native vlan 60`,hi:`switchport trunk native vlan 60`},{en:`A spanning-tree root bridge for VLAN 60`,hi:`VLAN 60 ke liye spanning-tree root bridge`}],a:0,w:{en:`VLAN 60 is in the allowed list but not "active in management domain", and show vlan brief has no VLAN 60: it does not exist locally. Create it (and assign the desk ports). It is already allowed, so adding it again changes nothing.`,hi:`VLAN 60 allowed list mein hai par "active in management domain" mein nahi, aur show vlan brief mein VLAN 60 nahi hai: locally exist hi nahi karta. Ise banao (aur desk ports assign karo). Yeh pehle se allowed hai, dobara add karne se kuch nahi badlega.`}},{title:{en:`Phones boot but land in the data VLAN`,hi:`Phones boot hote hain par data VLAN mein pahunch jaate hain`},ticket:{en:`Maple Insurance, Gurugram. New Cisco desk phones on FL2-SW1 boot but take addresses from the PC subnet and fail to register with the call server in voice VLAN 150. PCs behind the phones work.`,hi:`Maple Insurance, Gurugram. FL2-SW1 par naye Cisco desk phones boot hote hain par PC subnet se address lete hain aur voice VLAN 150 ke call server par register nahi hote. Phones ke peeche PCs chal rahe hain.`},out:`FL2-SW1#show running-config interface GigabitEthernet1/0/12
interface GigabitEthernet1/0/12
 description DESK-2-12 PHONE+PC
 switchport access vlan 20
 switchport mode access
 no cdp enable
 spanning-tree portfast
end

FL2-SW1#show interfaces GigabitEthernet1/0/12 switchport | include Voice
Voice VLAN: none`,q:{en:`What should be added to Gi1/0/12?`,hi:`Gi1/0/12 par kya add karna chahiye?`},o:[{en:`switchport mode trunk`,hi:`switchport mode trunk`},{en:`switchport access vlan 150`,hi:`switchport access vlan 150`},{en:`switchport voice vlan 150 and cdp enable`,hi:`switchport voice vlan 150 aur cdp enable`},{en:`switchport trunk native vlan 150`,hi:`switchport trunk native vlan 150`}],a:2,w:{en:`There is no voice VLAN, and CDP is disabled on the port, so the Cisco phone cannot learn one. Add switchport voice vlan 150 and re-enable CDP (LLDP-MED for non-Cisco phones). Moving the access VLAN to 150 would break the PCs, and the port should stay an access port, not a trunk.`,hi:`Voice VLAN nahi hai, aur port par CDP disabled hai, isliye Cisco phone koi voice VLAN seekh nahi sakta. switchport voice vlan 150 add karo aur CDP wapas enable karo (non-Cisco phones ke liye LLDP-MED). Access VLAN 150 karne se PCs toot jaayenge, aur port access port hi rehna chahiye, trunk nahi.`}},{title:{en:`Campus-wide outage after a switch was connected`,hi:`Ek switch jodne ke baad poore campus ka outage`},ticket:{en:`Ganga College, Varanasi. Monday 08:05: every lab and office is offline. Over the weekend a student assistant connected a switch brought back from the training room (management IP 10.99.0.77). Yesterday the core showed configuration revision 14.`,hi:`Ganga College, Varanasi. Monday 08:05: har lab aur office offline hai. Weekend par ek student assistant ne training room se laaya switch (management IP 10.99.0.77) jod diya. Kal core configuration revision 14 dikha raha tha.`},out:`CORE-SW1#show vtp status | include Domain|Mode|Revision|modified
VTP Domain Name                 : NK-CAMPUS
VTP Pruning Mode                : Disabled
Configuration last modified by 10.99.0.77 at 9-27-26 18:02:11
VTP Operating Mode                : Server
Configuration Revision            : 88

CORE-SW1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi1/0/1, Gi1/0/2
250  LAB-TEST                         active
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`,q:{en:`What happened, and what is the right recovery?`,hi:`Kya hua, aur sahi recovery kya hai?`},o:[{en:`A spanning-tree loop; reload the core switch`,hi:`Spanning-tree loop; core switch reload karo`},{en:`A native VLAN mismatch on the new switch's uplink; match the native VLAN`,hi:`Naye switch ke uplink par native VLAN mismatch; native VLAN match karo`},{en:`The vlan.dat file is corrupted; erase startup-config on the core`,hi:`vlan.dat file corrupt hai; core par erase startup-config karo`},{en:`The lab switch's higher VTP revision overwrote the VLAN database; disconnect it, set VTP transparent, recreate VLANs from backup`,hi:`Lab switch ke zyada VTP revision ne VLAN database overwrite kar diya; use hatao, VTP transparent set karo, backup se VLANs dobara banao`}],a:3,w:{en:`The revision jumped from 14 to 88 and was last modified by the lab switch: its database (only VLAN 250) replaced the campus VLANs, so access ports became inactive. Remove the switch, set VTP transparent or off (or reset its revision), and recreate the VLANs from the last backup; ports recover as each VLAN returns.`,hi:`Revision 14 se 88 ho gaya aur last modify lab switch ne kiya: uske database (sirf VLAN 250) ne campus VLANs replace kar diye, isliye access ports inactive ho gaye. Switch hatao, VTP transparent ya off set karo (ya uska revision reset karo), aur last backup se VLANs dobara banao; har VLAN wapas aate hi ports recover ho jaate hain.`}},{title:{en:`QA lab lost after a clean-up`,hi:`Clean-up ke baad QA lab gayab`},ticket:{en:`Ravi Pharma, Ahmedabad. After last night's "remove unused VLANs" change on FLR2-SW1, the QA lab PCs on Gi1/0/10 to Gi1/0/12 have no network, though their link lights are on.`,hi:`Ravi Pharma, Ahmedabad. FLR2-SW1 par kal raat ke "unused VLANs hatao" change ke baad Gi1/0/10 se Gi1/0/12 ke QA lab PCs ka network nahi hai, jabki unki link lights on hain.`},out:`FLR2-SW1#show interfaces GigabitEthernet1/0/10 switchport | include Mode
Administrative Mode: static access
Operational Mode: static access
Access Mode VLAN: 45 (Inactive)

FLR2-SW1#show vlan brief | include 45
FLR2-SW1#

FLR2-SW1#show archive log config all | include vlan 45
   31  1   neteng@vty1  |no vlan 45`,q:{en:`What is the fastest correct fix?`,hi:`Sabse tez sahi fix kya hai?`},o:[{en:`Move the ports to VLAN 1, where deleted-VLAN ports belong`,hi:`Ports ko VLAN 1 mein daalo, jahan deleted-VLAN ke ports jaate hain`},{en:`Recreate VLAN 45 (vlan 45, name QA-LAB)`,hi:`VLAN 45 dobara banao (vlan 45, name QA-LAB)`},{en:`shutdown and no shutdown the three ports`,hi:`Teeno ports par shutdown aur no shutdown`},{en:`Make the ports trunks so they carry all VLANs`,hi:`Ports ko trunk banao taaki woh saare VLANs carry karein`}],a:1,w:{en:`VLAN 45 was deleted while ports still used it, so they are inactive: they keep "access vlan 45" but forward nothing and vanish from show vlan brief. Recreating VLAN 45 restores them immediately. They never fall back to VLAN 1, and bouncing the ports changes nothing.`,hi:`Ports abhi use kar rahe the tab VLAN 45 delete hua, isliye woh inactive hain: "access vlan 45" rakhte hain par kuch forward nahi karte aur show vlan brief se gayab ho jaate hain. VLAN 45 dobara banane se woh turant wapas aa jaate hain. Woh kabhi VLAN 1 mein nahi jaate, aur ports bounce karne se kuch nahi badalta.`}},{title:{en:`Template pushed, uplink not trunking`,hi:`Template push hua, uplink trunking nahi kar raha`},ticket:{en:`Nilgiri Retail, Coimbatore. A hardening template was pushed to ACC-SW7 only. Since then, users on ACC-SW7 in VLAN 30 cannot reach anything beyond the switch.`,hi:`Nilgiri Retail, Coimbatore. Hardening template sirf ACC-SW7 par push hua. Tab se ACC-SW7 par VLAN 30 ke users switch ke aage kuch nahi pahunch pa rahe.`},out:`ACC-SW7#show interfaces GigabitEthernet1/0/48 switchport | include Mode|Negotiation
Administrative Mode: trunk
Operational Mode: trunk
Negotiation of Trunking: Off

DIST-SW2#show interfaces GigabitEthernet1/0/7 switchport | include Mode|Negotiation|Access
Administrative Mode: dynamic desirable
Operational Mode: static access
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)`,q:{en:`What is the cause and the fix?`,hi:`Cause aur fix kya hai?`},o:[{en:`ACC-SW7 no longer sends DTP, so DIST-SW2's desirable port stays access; set DIST-SW2 Gi1/0/7 to switchport mode trunk (and nonegotiate)`,hi:`ACC-SW7 ab DTP nahi bhejta, isliye DIST-SW2 ka desirable port access rehta hai; DIST-SW2 Gi1/0/7 ko switchport mode trunk (aur nonegotiate) karo`},{en:`Native VLAN mismatch between the two switches`,hi:`Dono switches ke beech native VLAN mismatch`},{en:`VLAN 30 is missing from the allowed list on ACC-SW7`,hi:`ACC-SW7 par allowed list se VLAN 30 missing hai`},{en:`DIST-SW2 needs switchport trunk encapsulation isl`,hi:`DIST-SW2 ko switchport trunk encapsulation isl chahiye`}],a:0,w:{en:`The template set trunk + nonegotiate on ACC-SW7. A dynamic desirable neighbour only trunks after a DTP exchange, and it now hears none, so it stays access in VLAN 1: one side tags, the other does not. Make DIST-SW2's port a static trunk too. There is no native mismatch on a link where only one side trunks, and ISL is legacy.`,hi:`Template ne ACC-SW7 par trunk + nonegotiate set kiya. Dynamic desirable neighbour DTP exchange ke baad hi trunk banta hai, aur ab use koi DTP sunai nahi deta, isliye woh VLAN 1 mein access rehta hai: ek side tag karti hai, doosri nahi. DIST-SW2 ka port bhi static trunk banao. Jis link par sirf ek side trunk hai wahan native mismatch nahi hota, aur ISL legacy hai.`}}];export{e as default};